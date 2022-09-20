from flask import Flask

from flask_cors import CORS
from views import register_blueprint

from werkzeug.middleware.proxy_fix import ProxyFix

app = Flask(__name__)
app.jinja_env.auto_reload = True
register_blueprint(app)
app.wsgi_app = ProxyFix(app.wsgi_app)
