import sys

def extract_text_from_rtf(file_path):
    try:
        with open(file_path, 'r') as f:
            content = f.read()
            
        text = ""
        in_control_word = False
        in_group = 0
        
        i = 0
        while i < len(content):
            c = content[i]
            
            if c == '\\':
                in_control_word = True
                # Check for special characters like \{, \}, \\
                if i + 1 < len(content) and content[i+1] in ['{', '}', '\\']:
                    text += content[i+1]
                    i += 2
                    in_control_word = False
                    continue
            elif c == '{':
                in_group += 1
                in_control_word = False
            elif c == '}':
                in_group -= 1
                in_control_word = False
            elif c == '\n' or c == '\r':
                in_control_word = False
            elif in_control_word:
                if c == ' ':
                    in_control_word = False
                elif not c.isalnum() and c != '-':
                    in_control_word = False
                    # If it was a space that ended the control word, we ignore it? 
                    # RTF spec says space after control word is delimiter.
                    # But if we just hit a non-alnum, we might want to keep it if it's not a delimiter.
                    # For simple extraction, let's just skip control words.
            else:
                text += c
            
            i += 1
            
        # This is a very naive extractor. A better one would handle encoding, etc.
        # But let's try to just get readable ascii.
        
        # Alternative: just filter for printable ascii sequences > length 3
        import re
        clean_text = re.sub(r'\\[a-z0-9]+ ?', ' ', content) # remove control words
        clean_text = re.sub(r'[{}]', '', clean_text) # remove braces
        
        # hex chars \'xx
        def replace_hex(match):
            try:
                return chr(int(match.group(1), 16))
            except:
                return ''
        clean_text = re.sub(r"\\'([0-9a-fA-F]{2})", replace_hex, clean_text)
        
        lines = clean_text.split('\n')
        for line in lines:
            line = line.strip()
            if len(line) > 5:
                print(line)
                
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        extract_text_from_rtf(sys.argv[1])
