# --- flask --- #
from flask import Blueprint, request, jsonify,session
#from flask_security import logout_user, login_required
from flask_login import login_user, current_user, logout_user

# --- our models ---- #
from models import user
from models.PSAbotLoginManager import UserModel, SSOModel

# --- set route --- #
login_api = Blueprint("login_api", __name__)


# --- google OAuth sign in api --- #
@login_api.route('/google_sign_in', methods=['POST'])
def google_sign_in():
    token = request.json['id_token']
    
    id_info = SSOModel.google_OAuth_login(token)
    if id_info['error']:
        return jsonify(id_info)
    
    # 取得使用者資料，若使用者不存在就建立一份
    user_dict = user.query_user(id_info['sub'])
    if user_dict == None:
        user_dict = {
            "_id" : id_info['sub'],
            "role" : 'google_user',
            "name" : id_info['name'],
            "email" : id_info['email'],
            "pwd": "",
            "skill" : [],
            "record" : {
                "posts" : [],
                "responses" : []
            },
            "notification":[]
        }
        user.insert_user(user_dict)
        user_dict = user.query_user(id_info['sub'])
        user_dict.update({'first_login':True})
    else:
        user_dict.update({'first_login':False})

    # --- flask login --- #
    user_now = UserModel(user_dict['_id'])  
    login_user(user_now) 
    session['user_id'] = user_dict['_id']
    session['role'] = user_dict['role']
    return jsonify(user_dict)

@login_api.route('/facebook_sign_in', methods=['POST'])
def facebook_sign_in():
    data = request.get_json()
    user_dict = user.query_user(data['id'])
    # 取得使用者資料，若使用者不存在就建立一份
    if user_dict == None:
        user_dict = {
            "_id" : data['id'],
            "role" : 'facebook_user',
            "name" : data['name'],
            "email" : "",
            "pwd" : "",
            "skill" : [],
            "record" : {
                "posts" : [],
                "responses" : []
            },
            "notification":[]
        }
        user.insert_user(user_dict)
        user_dict = user.query_user(data['id'])
        user_dict.update({'first_login':True})
    else:
        user_dict.update({'first_login':False})
    # --- flask login --- #
    user_now = UserModel(user_dict['_id'])  
    login_user(user_now) 
    session['user_id'] = user_dict['_id']
    session['role'] = user_dict['role']
    print(user_dict)
    return jsonify(user_dict)

@login_api.route('/password_sign_in', methods=['POST'])
def password_sign_in():
    data = request.get_json()
    print(data)
    user_dict = user.query_user(data['_id'])
    
    # 檢查是否有該筆資料
    if user_dict != None:
        if user_dict['pwd'] == data['pwd']:  
            # --- flask login --- #
            user_now = UserModel(user_dict['_id'])  
            login_user(user_now) 
            session['user_id'] = user_dict['_id']
            session['role'] = user_dict['role']
            user_role = {'_id': user_dict['_id'],'role':user_dict['role']}
        else:
            user_role = {'_id': 'invalid.','role':''}
    
    else:
        user_role = {'_id': 'invalid.','role':''}
    print(user_role)
    return jsonify(user_role)

@login_api.route('/logout', methods=['GET'])
def logout():
    try:
        msg = {
            "msg" : "user " + current_user.get_id() + " is logged out."
        }
        logout_user()
        session['user_id'] = None
        session['role'] = None
    except Exception as e :
        msg = {"error" : e.__class__.__name__ + ":" +e.args[0]}
    return jsonify(msg)