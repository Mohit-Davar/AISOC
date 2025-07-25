import pyttsx3
import playsound
import smtplib
import requests
from email.mime.text import MIMEText

# Violation settings
CONFIDENCE_THRESHOLD = 0.6
VIOLATION_LABELS = ["no_helmet", "no_vest", "no_mask", "no_gloves", "no_goggles"]
ALERT_SOUND_PATH = r"D:\BinaryBrains\alarm2.mp3"

# WhatsApp
WHATSAPP_ACCESS_TOKEN = 'EAAPSWuqLOZCEBPFMxK47MFCZBlNhpD62ZArxmfcIHRjb7ECKeWKTnxUwUnFJgbtqZCVgfGGzObDTIAbWhRGfsRP8ZCVTMLUz8DVVVSUxmwkSzElay7yrsZCpDzorXt6BsZALiE3JgqgMQcEutvUmSnMY01xZAYnFY8lGDpF3ZBBPhwCDLIYfGMkhZBgWkuZASPlI4X4esltCxZAniH0G2Omo5GJ8NO6rJtbAdagjUcfaeieOpJZB3YrZCy'
PHONE_NUMBER_ID = '742762512246701'
TO_PHONE_NUMBER = '917976229497'

# Email
FROM_EMAIL = "khushalnagal512@gmail.com"
APP_PASSWORD = "vnjqbfjfyxcozdje"
TO_EMAIL = "khushalnagal512@gmail.com"

# Init TTS
tts_engine = pyttsx3.init()
tts_engine.setProperty("rate", 200)

# === ALERT FUNCTIONS ===
def play_alert_sound():
    try:
        playsound.playsound(ALERT_SOUND_PATH)
    except Exception as e:
        print(f"[SOUND] Error: {e}")

def speak_alert(text: str):
    try:
        tts_engine.say(text)
        tts_engine.runAndWait()
    except Exception as e:
        print(f"[TTS] Error: {e}")

def send_whatsapp_alert(message: str):
    url = f"https://graph.facebook.com/v18.0/{PHONE_NUMBER_ID}/messages"
    headers = {
        "Authorization": f"Bearer {WHATSAPP_ACCESS_TOKEN}",
        "Content-Type": "application/json"
    }
    payload = {
        "messaging_product": "whatsapp",
        "to": TO_PHONE_NUMBER,
        "type": "text",
        "text": {"body": message}
    }

    try:
        response = requests.post(url, headers=headers, json=payload)
        if response.status_code == 200:
            print("[WHATSAPP] Sent ✅")
        else:
            print(f"[WHATSAPP] Failed ({response.status_code}): {response.text}")
    except Exception as e:
        print(f"[WHATSAPP] Error: {e}")

def send_email_alert(subject: str, body: str):
    msg = MIMEText(body)
    msg["Subject"] = subject
    msg["From"] = FROM_EMAIL
    msg["To"] = TO_EMAIL

    try:
        server = smtplib.SMTP_SSL("smtp.gmail.com", 465)
        server.login(FROM_EMAIL, APP_PASSWORD)
        server.send_message(msg)
        server.quit()
        print("[EMAIL] Sent ✅")
    except Exception as e:
        print(f"[EMAIL] Error: {e}")

# === UTILITY ===
def check_violation(label: str, confidence: float, violated_labels: list):
    if label in VIOLATION_LABELS and confidence >= CONFIDENCE_THRESHOLD:
        print(f"[ALERT] Violation: {label} | Confidence: {confidence:.2f}")
        violated_labels.append(label)
    else:
        print(f"[INFO] Safe or ignored → {label} ({confidence:.2f})")

def format_alert_text(violated_labels: list) -> str:
    readable = [label.replace("no_", "").capitalize() for label in violated_labels]

    if len(readable) == 1:
        return f"Warning! {readable[0]} not detected."
    elif len(readable) == 2:
        return f"Warning! {readable[0]} and {readable[1]} not detected."
    else:
        return f"Warning! {', '.join(readable[:-1])}, and {readable[-1]} not detected."

def trigger_alerts(violated_labels: list):
    alert_text = format_alert_text(violated_labels)

    play_alert_sound()
    speak_alert(alert_text)
    send_whatsapp_alert(f"🚨 PPE Violation Alert: {alert_text}")
    send_email_alert("🚨 PPE Violation Alert", alert_text)

# === MAIN EXECUTION ===
if __name__ == "__main__":
    detections = [
        {"label": "no_mask", "confidence": 0.91},
        {"label": "no_helmet", "confidence": 0.85}
    ]
    violated_labels = []

    for det in detections:
        check_violation(det["label"], det["confidence"], violated_labels)

    if violated_labels:
        trigger_alerts(violated_labels)
    else:
        print("[INFO] No violations detected.")