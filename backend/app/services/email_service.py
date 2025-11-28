import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional
import os
from dotenv import load_dotenv

# Charger les variables d'environnement
load_dotenv()

# Configuration email
SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
FROM_EMAIL = os.getenv("FROM_EMAIL", "noreply@makiti.com")
FROM_NAME = "Equipe Makiti"

def send_email(to_email: str, subject: str, html_content: str, text_content: Optional[str] = None):
    """Envoyer un email"""
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = f"{FROM_NAME} <{FROM_EMAIL}>"
        msg["To"] = to_email

        # Version texte
        if text_content:
            part1 = MIMEText(text_content, "plain")
            msg.attach(part1)

        # Version HTML
        part2 = MIMEText(html_content, "html")
        msg.attach(part2)

        # Envoyer l'email (si SMTP configuré)
        if SMTP_USER and SMTP_PASSWORD:
            with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
                server.starttls()
                server.login(SMTP_USER, SMTP_PASSWORD)
                server.sendmail(FROM_EMAIL, to_email, msg.as_string())
            print(f"✅ Email envoyé à {to_email}")
            return True
        else:
            # Mode développement - afficher dans la console
            print(f"📧 [DEV MODE] Email pour {to_email}:")
            print(f"   Sujet: {subject}")
            print(f"   Contenu: {text_content or 'Voir HTML'}")
            return True
    except Exception as e:
        print(f"❌ Erreur envoi email: {e}")
        return False


# ==================== TEMPLATES D'EMAILS ====================

def send_seller_approved_email(to_email: str, seller_name: str, business_name: str):
    """Email d'approbation du compte vendeur"""
    subject = "🎉 Félicitations ! Votre compte vendeur Makiti est approuvé"
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
            .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
            .button {{ display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }}
            .footer {{ text-align: center; margin-top: 20px; color: #666; font-size: 12px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎉 Félicitations {seller_name} !</h1>
            </div>
            <div class="content">
                <p>Nous avons le plaisir de vous informer que votre demande de compte vendeur pour <strong>{business_name}</strong> a été <strong style="color: #22c55e;">approuvée</strong> !</p>
                
                <p>Vous pouvez maintenant :</p>
                <ul>
                    <li>✅ Créer et publier vos produits</li>
                    <li>✅ Gérer votre boutique en ligne</li>
                    <li>✅ Recevoir des commandes de clients</li>
                    <li>✅ Suivre vos ventes et statistiques</li>
                </ul>
                
                <p style="text-align: center;">
                    <a href="http://localhost:3000/seller/dashboard" class="button">Accéder à ma boutique</a>
                </p>
                
                <p>Conseils pour bien démarrer :</p>
                <ol>
                    <li>Ajoutez des photos de qualité pour vos produits</li>
                    <li>Rédigez des descriptions détaillées</li>
                    <li>Fixez des prix compétitifs</li>
                    <li>Répondez rapidement aux commandes</li>
                </ol>
                
                <p>L'équipe Makiti est là pour vous accompagner dans votre succès !</p>
            </div>
            <div class="footer">
                <p>© 2024 Makiti Marketplace - Tous droits réservés</p>
                <p>Cet email a été envoyé à {to_email}</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    text_content = f"""
    Félicitations {seller_name} !
    
    Votre demande de compte vendeur pour {business_name} a été approuvée !
    
    Vous pouvez maintenant créer et publier vos produits sur Makiti.
    
    Connectez-vous sur http://localhost:3000/seller/dashboard pour commencer.
    
    L'équipe Makiti
    """
    
    return send_email(to_email, subject, html_content, text_content)


def send_seller_rejected_email(to_email: str, seller_name: str, reason: Optional[str] = None):
    """Email de refus du compte vendeur"""
    subject = "Makiti - Mise à jour de votre demande vendeur"
    
    reason_text = reason or "Votre dossier ne répond pas à nos critères actuels."
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background: #f59e0b; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
            .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
            .reason {{ background: #fef3c7; padding: 15px; border-radius: 5px; margin: 15px 0; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Demande vendeur</h1>
            </div>
            <div class="content">
                <p>Bonjour {seller_name},</p>
                
                <p>Nous avons examiné votre demande de compte vendeur et malheureusement, nous ne pouvons pas l'approuver pour le moment.</p>
                
                <div class="reason">
                    <strong>Raison :</strong> {reason_text}
                </div>
                
                <p>Vous pouvez soumettre une nouvelle demande après avoir corrigé les points mentionnés.</p>
                
                <p>Si vous avez des questions, n'hésitez pas à nous contacter.</p>
                
                <p>Cordialement,<br>L'équipe Makiti</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    return send_email(to_email, subject, html_content)


def send_new_order_email(to_email: str, seller_name: str, order_id: str, items: list, total: float):
    """Email de nouvelle commande pour le vendeur"""
    subject = f"🛒 Nouvelle commande #{order_id[-8:]} sur Makiti"
    
    items_html = ""
    for item in items:
        items_html += f"""
        <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">{item['product_name']}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">{item['quantity']}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">{item['total']:.2f} €</td>
        </tr>
        """
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background: #22c55e; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
            .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
            .button {{ display: inline-block; background: #22c55e; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; }}
            table {{ width: 100%; border-collapse: collapse; margin: 20px 0; }}
            th {{ background: #f3f4f6; padding: 10px; text-align: left; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🛒 Nouvelle commande !</h1>
                <p>Commande #{order_id[-8:]}</p>
            </div>
            <div class="content">
                <p>Bonjour {seller_name},</p>
                
                <p>Vous avez reçu une nouvelle commande sur Makiti !</p>
                
                <table>
                    <thead>
                        <tr>
                            <th>Produit</th>
                            <th style="text-align: center;">Quantité</th>
                            <th style="text-align: right;">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items_html}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colspan="2" style="padding: 10px; font-weight: bold;">Total</td>
                            <td style="padding: 10px; font-weight: bold; text-align: right;">{total:.2f} €</td>
                        </tr>
                    </tfoot>
                </table>
                
                <p style="text-align: center;">
                    <a href="http://localhost:3000/seller/orders" class="button">Voir la commande</a>
                </p>
                
                <p>N'oubliez pas de traiter cette commande rapidement !</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    return send_email(to_email, subject, html_content)


def send_order_status_email(to_email: str, customer_name: str, order_id: str, new_status: str):
    """Email de changement de statut de commande pour le client"""
    
    status_messages = {
        "confirmed": ("✅ Commande confirmée", "Votre commande a été confirmée par le vendeur."),
        "processing": ("📦 En préparation", "Votre commande est en cours de préparation."),
        "shipped": ("🚚 Expédiée", "Votre commande a été expédiée ! Elle arrivera bientôt."),
        "delivered": ("🎉 Livrée", "Votre commande a été livrée. Merci pour votre achat !"),
        "cancelled": ("❌ Annulée", "Votre commande a été annulée."),
    }
    
    title, message = status_messages.get(new_status, ("Mise à jour", "Le statut de votre commande a changé."))
    
    subject = f"{title} - Commande #{order_id[-8:]}"
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background: #3b82f6; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
            .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
            .status {{ font-size: 24px; text-align: center; margin: 20px 0; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>{title}</h1>
                <p>Commande #{order_id[-8:]}</p>
            </div>
            <div class="content">
                <p>Bonjour {customer_name},</p>
                
                <div class="status">{title}</div>
                
                <p>{message}</p>
                
                <p>Vous pouvez suivre votre commande dans votre espace client.</p>
                
                <p>Merci de votre confiance !<br>L'équipe Makiti</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    return send_email(to_email, subject, html_content)


def send_low_stock_alert(to_email: str, seller_name: str, product_name: str, current_stock: int):
    """Email d'alerte stock faible"""
    subject = f"⚠️ Stock faible : {product_name}"
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background: #f59e0b; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
            .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
            .alert {{ background: #fef3c7; padding: 20px; border-radius: 5px; text-align: center; margin: 20px 0; }}
            .button {{ display: inline-block; background: #f59e0b; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>⚠️ Alerte Stock</h1>
            </div>
            <div class="content">
                <p>Bonjour {seller_name},</p>
                
                <div class="alert">
                    <h2>{product_name}</h2>
                    <p style="font-size: 36px; margin: 10px 0;"><strong>{current_stock}</strong></p>
                    <p>unités restantes</p>
                </div>
                
                <p>Pensez à réapprovisionner ce produit pour éviter les ruptures de stock.</p>
                
                <p style="text-align: center;">
                    <a href="http://localhost:3000/seller/dashboard" class="button">Gérer mes produits</a>
                </p>
            </div>
        </div>
    </body>
    </html>
    """
    
    return send_email(to_email, subject, html_content)
