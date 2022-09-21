##flask basic framework
from flask import Flask
from views import register_blueprint

#flask-cors: calling api from web
from flask_cors import CORS

#flask-login: sign in authentication
from os import urandom
from models.PSAbotLoginManager import PSAbotLoginManager,UserModel

#middleware proxy fix: make nginx reverse proxy point to the app directly
from werkzeug.middleware.proxy_fix import ProxyFix


#set flask app
app = Flask(__name__)

#reload when templates changes
app.jinja_env.auto_reload = True

#call api through web
CORS(app)

# --------- login --------- #
app.config['SECRET_KEY'] = urandom(24).hex()
login_manager = PSAbotLoginManager(app)
@login_manager.user_loader
def user_loader(user_id):  
    user_now = UserModel(user_id)   
    return user_now
# ------------------------- #

#regist app
register_blueprint(app)


app.wsgi_app = ProxyFix(app.wsgi_app)

