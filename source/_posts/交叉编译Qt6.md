---
title: 交叉编译Qt6
author: Awesone
top: false
cover: false
comments: true
toc: true
copyright: true
date: 2026-06-10 15:14:42
img:
coverImg:
password:
summary:
categories:
  - 环境搭建
  - Qt6
tags:
  - 交叉编译
  - ARM
---

<!-- 在此处开始撰写正文 -->
> 交叉编译 Qt6 源码是一个相对复杂的过程，因为 Qt6 完全转向了 CMake 构建系统，且引入了“主机工具（Host Tools）”的概念。与 Qt5 不同，Qt6 在交叉编译时，必须先编译一套能在宿主机（Host，如 x86_64 Linux）上运行的 Qt，用于生成 moc、rcc、qsb等中间代码工具，然后再利用这些工具交叉编译目标平台（Target，如 ARM/aarch64）的 Qt 库。

以下是基于 Ubuntu 宿主环境交叉编译 Qt6（ARM32 为例）的详细配置步骤。

##### 一、 核心概念与准备

在开始之前，需明确以下关键要素：
- 宿主机 (Host)‌: 执行编译操作的机器（通常为 x86_64 Linux）。
- 目标机 (Target)‌: 运行最终程序的嵌入式设备（如 ARM64）。
- Sysroot‌: 目标机文件系统的镜像（包含 /lib, /usr/include, /usr/lib 等），用于提供目标平台的头文件和链接库。
- 交叉编译工具链 (Toolchain)‌: 能在宿主机运行，但生成目标机代码的编译器（如 aarch64-linux-gnu-gcc）。
- Host Qt‌: 先在宿主机编译安装的 Qt 版本，‌必须与交叉编译的 Qt 版本完全一致‌，用于提供构建过程中需要的可执行工具。

##### 二、 环境部署
1.  安装依赖包
在 Ubuntu 宿主机上安装基础开发依赖：
```
sudo apt-get update
sudo apt-get install build-essential libgl1-mesa-dev libfontconfig1-dev libfreetype6-dev \
libx11-dev libxext-dev libxfixes-dev libxi-dev libxrender-dev libxcb1-dev libxkbcommon-x11-dev \
libxcb-glx0-dev libxcb-icccm4-dev libxcb-image0-dev libxcb-keysyms1-dev libxcb-randr0-dev \
libxcb-shape0-dev libxcb-shm0-dev libxcb-sync1-dev libxcb-xfixes0-dev libxcb-xinerama0-dev \
libxcb-xkb-dev libxcb-cursor0-dev libdbus-1-dev libssl-dev libpq-dev libmysqlclient-dev \
libsqlite3-dev libgstreamer1.0-dev libgstreamer-plugins-base1.0-dev flex bison gperf \
ruby python3 perl cmake ninja-build
```
注意：Qt6 推荐使用 Ninja 作为构建后端，速度比 Make 快。
2. 准备交叉编译工具链
你可以使用发行版提供的工具链（如 gcc-arm-9.2-2019.12-x86_64-arm-none-linux-gnueabihf），或者使用厂商提供的 SDK（如瑞芯、全志、树莓派官方工具链）。
假设工具链安装在 /usr/local/arm-2019.12，确保其 bin 目录已加入 PATH：
```
export PATH= /usr/local/arm-2019.12:$PATH
# 验证
arm-none-linux-gnueabihf-gcc --version
```
3. 准备 Sysroot
从目标开发板同步根文件系统到宿主机，或者使用 SDK 提供的 sysroot。
sysroot可以从SDK从提取，详情见我的提取脚本sysroot.sh.
```
#!/bin/bash
# extract-sysroot-from-toolchain.sh

# 配置参数
TOOLCHAIN_DIR="/usr/local/arm-2019.12"
SYSROOT_DIR="/home/light/Documents/sysroot"
TARGET_ARCH="arm-none-linux-gnueabihf"

echo "=== 从预编译工具链提取 Sysroot ==="

# 1. 查找工具链中的 sysroot 目录
# 常见位置
POSSIBLE_PATHS=(
    "${TOOLCHAIN_DIR}/${TARGET_ARCH}/sysroot"
    "${TOOLCHAIN_DIR}/${TARGET_ARCH}/libc"
    "${TOOLCHAIN_DIR}/sysroot"
    "${TOOLCHAIN_DIR}/arm-linux-gnueabihf/libc"
)

for path in "${POSSIBLE_PATHS[@]}"; do
    if [ -d "$path" ]; then
        echo "找到 sysroot: $path"
        SYSROOT_SRC="$path"
        break
    fi
done

if [ -z "$SYSROOT_SRC" ]; then
    echo "错误: 在工具链中未找到 sysroot 目录"
    echo "尝试手动查找:"
    find "$TOOLCHAIN_DIR" -name "libc.so.6" -type f 2>/dev/null | head -5
    exit 1
fi

# 2. 创建目标 sysroot 目录
mkdir -p "$SYSROOT_DIR"
echo "目标 sysroot 目录: $SYSROOT_DIR"

# 3. 复制 sysroot 内容
echo "复制 sysroot 内容..."
cp -r "$SYSROOT_SRC"/* "$SYSROOT_DIR/" 2>/dev/null || true

# 4. 检查关键文件是否存在
check_essential_files() {
    local missing=0
    local files=(
        "$SYSROOT_DIR/lib/libc.so.6"
        "$SYSROOT_DIR/usr/include/stdio.h"
        "$SYSROOT_DIR/usr/lib/libstdc++.so.6"
    )
    
    for file in "${files[@]}"; do
        if [ ! -e "$file" ]; then
            echo "警告: 缺少关键文件 $file"
            missing=$((missing + 1))
        fi
    done
    
    if [ $missing -eq 0 ]; then
        echo "✓ Sysroot 基本文件完整"
    else
        echo "⚠ Sysroot 缺少 $missing 个关键文件"
    fi
}

check_essential_files

# 5. 验证提取的 sysroot
echo -e "\n=== 验证提取的 Sysroot ==="
echo "1. 检查架构:"
find "$SYSROOT_DIR/lib" -name "*.so" -exec file {} \; | head -3

echo -e "\n2. 检查 GCC 与 sysroot 的兼容性:"
cat > /tmp/test_sysroot.c << 'EOF'
#include <stdio.h>
#include <stddef.h>
int main() {
    printf("Sysroot test successful!\n");
    printf("Pointer size: %zu bytes\n", sizeof(void*));
    return 0;
}
EOF

# 使用工具链编译器测试 sysroot
if command -v ${TARGET_ARCH}-gcc &> /dev/null; then
    ${TARGET_ARCH}-gcc /tmp/test_sysroot.c --sysroot="$SYSROOT_DIR" -o /tmp/test_sysroot
    if [ $? -eq 0 ]; then
        echo "✓ 编译器能正确使用 sysroot"
        file /tmp/test_sysroot
    else
        echo "✗ 编译器无法使用 sysroot"
    fi
    rm -f /tmp/test_sysroot
fi

rm -f /tmp/test_sysroot.c
echo -e "\n=== Sysroot 提取完成 ==="
echo "位置: $SYSROOT_DIR"
echo "大小: $(du -sh "$SYSROOT_DIR" | cut -f1)"

```
重要提示：如果目标系统是 Debian/Ubuntu 等多架构系统，需注意库路径中的三元组目录（如arm-none-linux-gnueabihf），可能需要创建软链接或调整 CMake 配置以正确找到库。

##### 三、编译 Host Qt（主机工具）
这是 Qt6 交叉编译最关键且容易出错的一步。你需要先用本地编译器编译一套 Qt，仅安装必要的工具和开发文件。

1. 创建构建目录‌：
```
mkdir build && cd build
```
2. 配置 Host Qt‌：
假设源码在 ../qt-everywhere-src-6.11.0，安装路径为${QT_SRC_DIR}/../Qt6.11.0_arm

```
./configure \
  -prefix qt-everywhere-src-6.11.0/build \
  -opensource \
  -confirm-license \
  -release \
  -nomake examples \
  -nomake tests \
  -skip qtwebengine \
  -skip qtwebview \
  -skip qtquick3d \
  -- -DCMAKE_BUILD_TYPE=Release
```
注：可以跳过不必要的模块以加快编译速度。

3. 编译并安装‌：
```
cmake --build . --parallel $(nproc) #编译
sudo cmake --install .  #安装
```
此时，qt-everywhere-src-6.11.0/build目录下包含了后续交叉编译所需的 moc, rcc, qsb 等工具。

##### 四、 配置交叉编译Toolchain文件
创建一个 CMake 工具链文件，例如toolchain.cmake。这个文件告诉 CMake 如何使用交叉编译器以及在哪里找到目标系统的库。
```
# toolchain.cmake
# 设置目标系统和处理器架构 [ref_1]
set(CMAKE_SYSTEM_NAME Linux)
set(CMAKE_SYSTEM_PROCESSOR arm)
# 交叉编译器设置
set(CMAKE_C_COMPILER   /usr/local/arm-2019.12/bin/arm-none-linux-gnueabihf-gcc)
set(CMAKE_CXX_COMPILER /usr/local/arm-2019.12/bin/arm-none-linux-gnueabihf-g++)
# 关键：Qt特定设置
set(QT_HOST_PATH "/opt/Qt6.11/6.11.0/gcc_64")  # 主机Qt安装路径
set(CMAKE_PREFIX_PATH "/home/light/Documents/Qt6.11.0_arm")
set(QT_COMPILING_HOST_TOOLS ON)
# Sysroot 路径
set(CMAKE_SYSROOT /home/light/Documents/sysroot)
#set(CMAKE_FIND_ROOT_PATH ${CMAKE_SYSROOT})
set(CMAKE_FIND_ROOT_PATH /opt/Qt6.11/6.11.0/gcc_64/)
# 查找规则设置 [ref_1]
set(CMAKE_FIND_ROOT_PATH_MODE_PROGRAM NEVER)
set(CMAKE_FIND_ROOT_PATH_MODE_LIBRARY ONLY)
set(CMAKE_FIND_ROOT_PATH_MODE_INCLUDE ONLY)
set(CMAKE_FIND_ROOT_PATH_MODE_PACKAGE ONLY)
# 设置 C++17 标准
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
# 关键：禁用RenderDoc和其他不需要的特性
set(QT_FEATURE_renderdoc OFF CACHE BOOL "" FORCE)
set(QT_FEATURE_debugger OFF CACHE BOOL "" FORCE)  # 通常也不需要调试器
set(QT_FEATURE_process ON CACHE BOOL "" FORCE)
# 仅添加目标 sysroot 中的路径
list(APPEND CMAKE_PREFIX_PATH ${CMAKE_SYSROOT}/usr)
list(APPEND CMAKE_PREFIX_PATH ${CMAKE_SYSROOT}/usr/local)

# 关键：在find_package(Qt6)或其他操作前，显式设置策略
cmake_policy(SET CMP0054 NEW)
# 设置 pkg-config 路径（关键！）
#set(ENV{PKG_CONFIG_PATH} "${CMAKE_SYSROOT}/usr/lib/aarch64-linux-gnu/pkgconfig:${CMAKE_SYSROOT}/usr/share/pkgconfig")
#set(ENV{PKG_CONFIG_SYSROOT_DIR} ${CMAKE_SYSROOT})
# 设置构建类型（避免冲突）
if(NOT DEFINED CMAKE_BUILD_TYPE)
    set(CMAKE_BUILD_TYPE "Release" CACHE STRING "Build type" FORCE)
endif()
# 编译器标志
set(CMAKE_C_FLAGS "${CMAKE_C_FLAGS} -O2 -pipe")
set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -O2 -pipe")
# 链接器标志
set(CMAKE_EXE_LINKER_FLAGS "${CMAKE_EXE_LINKER_FLAGS} -Wl,-O1 -Wl,--as-needed")`

```
##### 五、交叉编译 Target Qt
1.   创建构建目录‌：
```
mkdir Qt6.11.0_arm && cd Qt6.11.0_arm
```
2. 配置 Target Qt‌：
这是最核心的命令，需要指定 Host Qt 路径、工具链文件、安装路径等。
可以使用一个脚本文件configure-qt-arm.sh实现：
```
# configure-qt-arm.sh
#!/bin/bash
set -e
# 基本路径
QT_SRC_DIR=$(pwd)
BUILD_DIR="${QT_SRC_DIR}/build"
INSTALL_DIR="${QT_SRC_DIR}/../Qt6.11.0_arm"
TOOLCHAIN_FILE="${QT_SRC_DIR}/toolchain.cmake"
# 清理旧构建
echo "清理旧构建..."
#rm -rf ${BUILD_DIR}
#mkdir -p ${BUILD_DIR}
cd ${BUILD_DIR}
# 检查宿主机的 Qt 安装（必须！）
if [ ! -d "/opt/Qt6.11/6.11.0/gcc_64" ]; then
    echo "错误：宿主机 Qt 6.11.0 未安装"
    echo "请先在宿主机安装 Qt 6.11.0（使用在线安装器或从源码编译）"
    exit 1
fi
# 运行 configure [ref_1]
echo "配置 Qt 6.11.0 交叉编译..."
${QT_SRC_DIR}/configure \
    -release \
    -platform linux-g++ \
    -device linux-arm-generic-g++ \
    -device-option CROSS_COMPILE=arm-none-linux-gnueabihf- \
    -qt-host-path /opt/Qt6.11/6.11.0/gcc_64 \
    -prefix ${INSTALL_DIR} \
    -opensource -confirm-license \
    -extprefix ${INSTALL_DIR} \
    -no-pch \
    -nomake examples -nomake tests \
    -nomake examples \
    -nomake tests \
    -no-openssl \
    -no-feature-zstd\
    -no-opengl \
    -submodules qtbase,qtdeclarative,qtsvg,qtserialport,qtvirtualkeyboard\
    -verbose \
    -- \
    -G Ninja \
    -DCMAKE_CXX_STANDARD=17 \
    -DCMAKE_TOOLCHAIN_FILE=${TOOLCHAIN_FILE} \
    -DQT_COMPILING_HOST_TOOLS=ON \
    -DCMAKE_BUILD_TYPE=Release \
    -DQT_FEATURE_cups=ON\
    -DFEATURE_wayland=$(grep -q "FEATURE_wayland ON" ${TOOLCHAIN_FILE} && echo "ON" || echo "OFF") \
    -DFEATURE_x11=$(grep -q "FEATURE_x11 ON" ${TOOLCHAIN_FILE} && echo "ON" || echo "OFF") \
    -DFEATURE_eglfs=$(grep -q "FEATURE_eglfs ON" ${TOOLCHAIN_FILE} && echo "ON" || echo "OFF")
```
参数详解：‌

- -prefix: 目标板上 Qt 的安装路径（运行时路径）。
- -extprefix: 宿主机上存放交叉编译后 Qt 文件的路径（部署时用）。
- -hostprefix: 之前编译好的 Host Qt 的安装路径。
- -sysroot: 目标板的 sysroot 路径。
- -DCMAKE_TOOLCHAIN_FILE: 指向第二步创建的 .cmake 文件。
- -DQT_HOST_PATH: 显式指定 Host Qt 路径，确保 CMake 找到正确的 moc/rcc 工具。
- -feature-wayland / -no-feature-xcb: 根据目标板支持的显示服务选择。嵌入式通常选 Wayland 或 EGLFS。

3. ‌处理配置错误‌：
- 如果提示缺少库，请检查 Sysroot 中是否包含对应的 .so 和 .h 文件。
- 如果提示 glibc 版本不兼容，请确保交叉编译器的版本不低于目标板上的 glibc 版本，或者更新 Sysroot。

4. ‌编译并安装‌：
```
cmake --build . --parallel $(nproc)
sudo cmake --install .
```
编译完成后，Qt 库将被安装到 -extprefix 指定的目录（如 ${QT_SRC_DIR}/../Qt6.11.0_arm）。
##### 六、 部署到目标板
1. 打包文件‌：
将 /home/user/qt6-install-arm64 目录下的所有文件打包。
2. 传输到开发板‌：
使用 scp 或 rsync 将文件传输到开发板的 /opt/qt6（或与 -prefix 一致的路径）。
```
rsync -avz  ${QT_SRC_DIR}/../Qt6.11.0_arm root@<target-ip>:/opt/qt6/

```
3. 配置环境变量‌：
在开发板的 .bashrc 或启动脚本中添加：
```
export QT_DIR=/opt/qt6
export LD_LIBRARY_PATH=$QT_DIR/lib:$LD_LIBRARY_PATH
export QT_QPA_PLATFORM=wayland  # 或 eglfs, linuxfb
export QT_PLUGIN_PATH=$QT_DIR/plugins
export QML_IMPORT_PATH=$QT_DIR/qml

```
##### 七、 常见问题与注意事项

1. Host Qt 与 Target Qt 版本必须严格一致‌：
Qt6 的构建工具（如 moc）生成的代码格式可能与不同小版本的解析器不兼容。务必使用同一份源码包分别编译 Host 和 Target 版本。
1. Sysroot 中的库路径问题‌：
Debian/Ubuntu 系的 ARM64 系统，库文件通常位于 /usr/lib/aarch64-linux-gnu/。如果CMake找不到库，可能需要在toolchain文件中添加：

```
set(CMAKE_LIBRARY_ARCHITECTURE aarch64-linux-gnu)
```
或者在 Sysroot 中创建软链接：ln -s lib/aarch64-linux-gnu lib。
3. OpenGL/EGL 支持：
嵌入式平台通常使用 EGLFS 或 Wayland。确保 Sysroot 中包含 libEGL.so, libGLESv2.so 以及相关的 DRM/KMS 头文件。如果使用 EGLFS，可能需要指定 -device-option CROSS_COMPILE=... 和具体的 mkspec（但在 CMake 模式下，主要通过 toolchain 和 feature 开关控制）。
4. 内存不足：
交叉编译 Qt6 非常消耗内存。建议宿主机至少有 16GB RAM，并使用 --parallel 控制并发数，避免 OOM（Out Of Memory）。
5. CMake 版本：
Qt6 要求 CMake 3.16 或更高版本，建议使用 3.21+ 以获得更好的支持。

通过以上步骤，你可以成功在 x86_64 Linux 宿主机上交叉编译 Qt6 源码，并部署到 ARM 嵌入式设备上。
6. 源码编译指定模块
 可以使用-submodules参数，如

```
sudo ../configure -prefix /opt/Qt6.11/6.11.0/gcc_64  -submodules qtopcua
sudo cmake --build . --parallel 4  #编译
sudo cmake --install .    #安装
```

----
注意事项：
- 制作一个sysroot   sysroot.sh从交叉编译工具链找到sysroot需要的文件
- 下载的交叉编译源码要与QT桌面版版本一致
- 手写一个cmake工具链
- 编译时使用-submodules指定要编译的模块
- 指定一个目录用来存放qt编译文件，交叉编译的qt安装文件


