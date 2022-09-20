from flask import Blueprint, render_template
#from flask_security import login_required

login_web = Blueprint("login_web", __name__)

@login_web.route("/login", methods=["GET", "POST"])
def login():
    return render_template('login.html')

