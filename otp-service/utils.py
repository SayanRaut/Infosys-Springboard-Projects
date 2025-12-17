import smtplib
import os
from email.mime.text import MIMEText
from dotenv import load_dotenv

load_dotenv()

def send_otp(to_email, otp):
    sender = os.getenv("MAIL_SENDER")
    password = os.getenv("MAIL_PASSWORD")

    print("DEBUG sender:", sender)
    print("DEBUG password exists:", bool(password))

    msg = MIMEText(f"Your Finex OTP is: {otp}")
    msg["Subject"] = "Finex Verification Code"
    msg["From"] = sender
    msg["To"] = to_email

    try:
        server = smtplib.SMTP("smtp.gmail.com", 587)
        server.starttls()
        server.login(sender, password)
        server.send_message(msg)
        server.quit()
        print("✅ Email sent successfully")
        return True
    except Exception as e:
        print("❌ Email error:", e)
        return False
