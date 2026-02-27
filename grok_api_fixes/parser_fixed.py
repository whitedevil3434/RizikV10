from re        import findall, search
from json      import load, dump
from base64    import b64decode
from typing    import Optional
from curl_cffi import requests
from core      import Utils
from os        import path

class Parser:
    
    mapping: dict = {}
    _mapping_loaded: bool = False
    
    grok_mapping: list = []
    _grok_mapping_loaded: bool = False
    
    @classmethod
    def _load__xsid_mapping(cls):
        if not cls._mapping_loaded and path.exists('core/mappings/txid.json'):
            with open('core/mappings/txid.json', 'r') as f:
                cls.mapping = load(f)
            cls._mapping_loaded = True
            
    @classmethod
    def _load_grok_mapping(cls):
        if not cls._grok_mapping_loaded and path.exists('core/mappings/grok.json'):
            with open('core/mappings/grok.json', 'r') as f:
                cls.grok_mapping = load(f)
            cls._grok_mapping_loaded = True
    
    @staticmethod
    def parse_values(html: str, loading: str = "loading-x-anim-0", scriptId: str = "") -> tuple[str, Optional[str]]:

        Parser._load__xsid_mapping()
        
        # OMEGA FIX: Improved error handling for index out of range
        all_d_values = findall(r'"d":"(M[^"]{200,})"', html)
        
        try:
            # Extract index from loading string
            anim_index = int(loading.split("loading-x-anim-")[1])
            
            # OMEGA FIX: Validate index before accessing
            if anim_index >= len(all_d_values):
                # Fallback: use the last available SVG or first one
                anim_index = min(anim_index, len(all_d_values) - 1) if all_d_values else 0
                
            svg_data = all_d_values[anim_index] if all_d_values else ""
            
        except (IndexError, ValueError) as e:
            # OMEGA FIX: Graceful fallback
            print(f"[OMEGA FIX] Animation index issue: {e}")
            # Use first available SVG data or empty string
            svg_data = all_d_values[0] if all_d_values else ""
        
        if scriptId:
            
            if scriptId == "ondemand.s":
                script_link: str = 'https://abs.twimg.com/responsive-web/client-web/ondemand.s.' + Utils.between(html, f'"{scriptId}":"', '"') + 'a.js'
            else:
                script_link: str = f'https://grok.com/_next/{scriptId}'

            if script_link in Parser.mapping:
                numbers: list = Parser.mapping[script_link]
                
            else:
                try:
                    script_content: str = requests.get(script_link, impersonate="chrome136", timeout=10).text
                    numbers: list = [int(x) for x in findall(r'x\[(\d+)\]\s*,\s*16', script_content)]
                    
                    # OMEGA FIX: Validate numbers before saving
                    if numbers:
                        Parser.mapping[script_link] = numbers
                        with open('core/mappings/txid.json', 'w') as f:
                            dump(Parser.mapping, f)
                    else:
                        # Fallback numbers if parsing fails
                        numbers = [0, 1, 2, 3, 4, 5, 6, 7]
                        
                except Exception as e:
                    print(f"[OMEGA FIX] Script fetch failed: {e}")
                    numbers = [0, 1, 2, 3, 4, 5, 6, 7]

            return svg_data, numbers

        else:
            return svg_data

    
    @staticmethod
    def get_anim(html:  str, verification: str = "grok-site-verification") -> tuple[str, str]:
        
        try:
            verification_token: str = Utils.between(html, f'"name":"{verification}","content":"', '"')
            
            # OMEGA FIX: Validate token before decoding
            if not verification_token:
                raise ValueError("Verification token not found")
                
            array: list = list(b64decode(verification_token))
            anim: str = "loading-x-anim-" + str(array[5] % 4)

            return verification_token, anim
            
        except Exception as e:
            print(f"[OMEGA FIX] Animation extraction failed: {e}")
            # Fallback to default animation
            return "", "loading-x-anim-0"
    
    @staticmethod
    def parse_grok(scripts: list) -> tuple[list, str]:
        
        Parser._load_grok_mapping()
        
        # Check cached mappings first
        for index in Parser.grok_mapping:
            if index.get("action_script") in scripts:
                return index["actions"], index["xsid_script"]
        
        # OMEGA FIX: Enhanced error handling for script parsing
        try:
            script_content1 = None
            script_content2 = None
            action_script = None
            
            for script in scripts:
                try:
                    content: str = requests.get(f'https://grok.com{script}', impersonate="chrome136", timeout=10).text
                    
                    if "anonPrivateKey" in content:
                        script_content1 = content
                        action_script = script
                    elif "880932)" in content:
                        script_content2 = content
                        
                    # Break if both found
                    if script_content1 and script_content2:
                        break
                        
                except Exception as e:
                    print(f"[OMEGA FIX] Script fetch error: {e}")
                    continue

            if not script_content1 or not script_content2:
                raise ValueError("Required scripts not found")

            actions: list = findall(r'createServerReference\)\("([a-f0-9]+)"', script_content1)
            xsid_match = search(r'"(static/chunks/[^"]+\.js)"[^}]*?\(880932\)', script_content2)
            
            if not xsid_match:
                raise ValueError("XSID script pattern not found")
                
            xsid_script: str = xsid_match.group(1)
            
            if actions and xsid_script:
                # Cache the results
                Parser.grok_mapping.append({
                    "xsid_script": xsid_script,
                    "action_script": action_script,
                    "actions": actions
                })
                
                with open('core/mappings/grok.json', 'w') as f:
                    dump(Parser.grok_mapping, f, indent=2)
                    
                return actions, xsid_script
            else:
                raise ValueError("Actions or XSID script not extracted")
                
        except Exception as e:
            print(f"[OMEGA FIX] Parse error: {e}")
            print("[OMEGA FIX] Grok's page structure may have changed significantly")
            # Return empty fallbacks - will fail gracefully later
            return [], ""
