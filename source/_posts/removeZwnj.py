import re

def remove_zwnj(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    # È¥³ý ZWNJ (U+200C)
    cleaned_content = content.replace('\u200c', '')
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(cleaned_content)

# Ê¹ÓÃ£ºremove_zwnj('your_file.txt')
