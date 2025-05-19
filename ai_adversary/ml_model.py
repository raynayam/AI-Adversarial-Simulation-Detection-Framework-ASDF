# Adversarial AI Module (with evasion level)

evasion_level = 1

class AdversarialAI:
    def __init__(self):
        global evasion_level
        self.evasion_level = evasion_level

    def adapt_attack(self, detection_feedback):
        global evasion_level
        if detection_feedback:
            evasion_level += 1
        print(f"[AI] Evasion level: {evasion_level}")
        self.evasion_level = evasion_level
        return f"evasion_level_{evasion_level}"

    @staticmethod
    def get_evasion_level():
        global evasion_level
        return evasion_level 