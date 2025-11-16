import threading
from flask import Flask
import discord
from discord import app_commands
from discord.ext import commands
import requests
import re
import io
import os
from dotenv import load_dotenv  # ← Pour .env en local

# === CHARGER .env (local uniquement) ===
load_dotenv()

# === FLASK (pour Render / UptimeRobot) ===
app = Flask(__name__)

@app.route('/')
def home():
    return "TanBot2000 est en vie !"

def run_flask():
    app.run(host='0.0.0.0', port=8080)

# === DISCORD BOT ===
intents = discord.Intents.default()
intents.message_content = True
bot = commands.Bot(command_prefix="!", intents=intents)
tree = bot.tree

# === CONFIG GITHUB ===
OWNER = "MOLDY12457"
REPO = "TanBot20000.games"
BRANCH = "master"
SUBDIR = ""  # ← Fichiers à la racine

APPID_PATTERN = re.compile(r'^\d+$')

# === RÉCUPÉRER LE ZIP DEPUIS GITHUB ===
def get_zip_from_repo(appid: str):
    path = f"{SUBDIR}{appid}.zip".lstrip("/")
    url = f"https://raw.githubusercontent.com/{OWNER}/{REPO}/{BRANCH}/{path}"
    try:
        resp = requests.get(url, timeout=15)
        if resp.status_code == 200:
            return resp.content, f"{appid}.zip"
    except Exception as e:
        print(f"[ERREUR ZIP] {e}")
    return None, None

# === INFO JEU DEPUIS STEAMDB ===
def get_game_info(appid: str):
    try:
        url = f"https://steamdb.info/app/{appid}/"
        headers = {'User-Agent': 'SteamToolsBot/1.0'}
        resp = requests.get(url, headers=headers, timeout=10)
        if resp.status_code != 200:
            return f"AppID {appid}", None
        name = re.search(r'<h1 class="pageheader">(.*?)</h1>', resp.text, re.I)
        name = name.group(1).strip() if name else f"AppID {appid}"
        logo = re.search(r'<img class="app-logo" src="(//steamdb\.info/static/img/apps/\d+/\w+\.jpg)"', resp.text)
        logo_url = f"https:{logo.group(1)}" if logo else None
        return name, logo_url
    except:
        return f"AppID {appid}", None

# === COMMANDE /get ===
@tree.command(name="get", description="Récupère un script SteamTools par AppID")
@app_commands.describe(appid="AppID du jeu (ex: 1000360)")
@app_commands.rename(appid="appid")
async def get_script(interaction: discord.Interaction, appid: str):
    await interaction.response.defer()

    if not APPID_PATTERN.match(appid):
        embed = discord.Embed(
            title="AppID Invalide",
            description="Utilise uniquement des chiffres.",
            color=0xff5555
        )
        embed.set_footer(text="Exemple: /get 1000360")
        await interaction.followup.send(embed=embed, ephemeral=True)
        return

    zip_data, zip_name = get_zip_from_repo(appid)
    if not zip_data:
        embed = discord.Embed(
            title="Script Introuvable",
            description=f"Aucun fichier trouvé pour **AppID `{appid}`**.\n\n"
                        f"Vérifie que `{appid}.zip` existe sur [GitHub](https://github.com/{OWNER}/{REPO}).",
            color=0xff6b6b
        )
        embed.set_thumbnail(url="https://i.imgur.com/5f3zG.png")
        embed.set_footer(text="Contacte l'admin si tu penses que c'est une erreur.")
        await interaction.followup.send(embed=embed, ephemeral=True)
        return

    game_name, logo_url = get_game_info(appid)
    file = discord.File(io.BytesIO(zip_data), filename=zip_name)

    embed = discord.Embed(
        title=game_name,
        url=f"https://steamdb.info/app/{appid}/charts/",
        description=f"**AppID:** `{appid}`\nFichier Lua pour **SteamTools**",
        color=0x1abc9c
    )
    embed.set_author(name="SteamTools Script", icon_url="https://i.imgur.com/5f3zG.png")
    if logo_url:
        embed.set_thumbnail(url=logo_url)
    embed.set_footer(text="Clique sur le titre → Charts SteamDB")

    await interaction.followup.send(embed=embed, file=file)

# === BOT PRÊT ===
@bot.event
async def on_ready():
    print(f"\n{bot.user} est en ligne !")
    print("Synchronisation des commandes slash...")
    try:
        synced = await tree.sync()
        print(f"Commandes synchronisées : {len(synced)}")
    except Exception as e:
        print(f"Erreur sync: {e}")
    print("\nUtilise /get <appid> dans Discord !\n")

# === LANCEMENT (local + Render) ===
if __name__ == "__main__":
    token = os.getenv("DISCORD_TOKEN")
    if not token:
        print("ERREUR : DISCORD_TOKEN manquant dans .env")
        exit(1)
    
    # Lancer Flask en arrière-plan
    threading.Thread(target=run_flask, daemon=True).start()
    bot.run(token)