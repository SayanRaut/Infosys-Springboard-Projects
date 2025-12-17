import smtplib
import os
from email.mime.text import MIMEText
from dotenv import load_dotenv

load_dotenv()

def send_email_otp(to_email: str, otp: str) -> bool:
    sender = os.getenv("MAIL_SENDER")
    password = os.getenv("MAIL_PASSWORD")

    msg = MIMEText(f"Your OTP is: {otp}\nValid for 5 minutes.")
    msg["Subject"] = "Login OTP"
    msg["From"] = sender
    msg["To"] = to_email

    try:
        server = smtplib.SMTP("smtp.gmail.com", 587)
        server.starttls()
        server.login(sender, password)
        server.send_message(msg)
        server.quit()
        return True
    except Exception as e:
        print("EMAIL ERROR:", e)
        return False
