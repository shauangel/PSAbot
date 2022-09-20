# --- flask --- #
from datetime import datetime
from flask import Blueprint,request, jsonify
'''匯入faq相關'''
from flask import Flask,flash,redirect
from werkzeug.utils import secure_filename
import os
import json
import re
# --- our models ---- #
from models import faq_data
from .TextAnalyze import TextAnalyze

faq_api = Blueprint('faq_api', __name__)

# 調整更新週期
@faq_api.route('/adjust_faq_update', methods=['POST'])
def adjust_faq_update():
    data = request.get_json()
    try:
        setting_dict = {
            'data_number':data['num'],
            'update_cycle':data['cycle']
        } 
        faq_data.adjust_update_cycle(setting_dict['data_number'],setting_dict['update_cycle'])
    except Exception as e :
        setting_dict = {"error" : e.__class__.__name__ + ":" +e.args[0]}
        print("錯誤訊息: ", e)
    return jsonify(setting_dict)

# 查看更新週期
@faq_api.route('/query_faq_update', methods=['POST'])
def query_faq_update():
    try:
        update_data = faq_data.query_update_cycle()
        update_data.pop('_id')
    except Exception as e :
        update_data = {"error" : e.__class__.__name__ + ":" +e.args[0]}
        print("錯誤訊息: ", e)
    return jsonify(update_data)

# 取得FAQ列表
@faq_api.route('/query_faq_list', methods=['POST'])
def query_faq_list():
    data = request.get_json()
    try: 
        list_dict = faq_data.query_list(data['page_size'],data['page_number'],data['option'])
        
    except Exception as e :
        list_dict = {"error" : e.__class__.__name__ + " : " +e.args[0]}
    return jsonify(list_dict)
# 依標籤取得FAQ列表
@faq_api.route('/query_faq_list_by_tag', methods=['POST'])
def query_faq_list_by_tag():
    data = request.get_json()
    try: 
        list_dict = faq_data.query_list_by_tag(data['tag'],data['page_size'],data['page_number'],data['option'])
        
    except Exception as e :
        list_dict = {"error" : e.__class__.__name__ + " : " +e.args[0]}
    return jsonify(list_dict)
# 依字串取得FAQ列表
@faq_api.route('/query_faq_list_by_string', methods=['POST'])
def query_faq_list_by_string():
    data = request.get_json()
    try: 
        list_dict = faq_data.query_list_by_string(data['search_string'],data['page_size'],data['page_number'],data['option'])
        
    except Exception as e :
        list_dict = {"error" : e.__class__.__name__ + " : " +e.args[0]}
    return jsonify(list_dict)
# 新增單篇FAQ
@faq_api.route('/insert_faq_post', methods=['POST'])
def insert_faq_post():
    data = request.get_json()
    try: 
        faq_dict = {
                        "_id" : "",          
                        "link" : data['link'],         
                        "question" : 
                        {
                            "_id" : "",       
                            "title" : data['question']['title'],    
                            "content": data['question']['content'],
                            "edit": data['question']['edit'],
                            "vote" : int(data['question']['vote']),      
                            "score" : [],
                        },
                        "answers" : 
                        [
                            {       
                                "answer_id" : "",
                                "content" : a['content'],
                                "edit" : a['edit'],
                                "vote" : int(a['vote']),     
                                "score" : [],
                            } for a in data['answers']
                        ],
                        "keywords" : [],     
                        "tags" : data['tags'],
                        "time" : datetime.now().replace(microsecond=0),
                        "view_count" : 0
        }
        if len(data['question']['content']) == 0 or len(data['question']['title'])==0:
            return jsonify({'message':'FAQ標題或內容不得為空 !'})
        # 呼叫文字分析模組進行分析
        textAnalyzer = TextAnalyze()
        # 去除code
        target_content = re.sub(r'<pre>.*?</pre>', ' ', faq_dict['question']['content'].replace('\n', '').replace('\r', ''))
        faq_dict['keyword'] = textAnalyzer.contentPreProcess(target_content)[0]
        faq_data.insert_faq(faq_dict,'inner_faq')
    except Exception as e :
        faq_dict = {"error" : e.__class__.__name__ + " : " +e.args[0]}
    return jsonify({"message":"更新成功"})
    


# 查看單篇FAQ
@faq_api.route('/query_faq_post', methods=['POST'])
def query_faq_post():
    data = request.get_json()
    try: 
        faq_dict = faq_data.query_faq_post(data['_id'])
    except Exception as e :
        faq_dict = {"error" : e.__class__.__name__ + " : " +e.args[0]}
    return jsonify(faq_dict)
# 對FAQ按讚
@faq_api.route('/like_faq_post', methods=['POST'])
def like_faq_post():
    data = request.get_json()
    try:
        score_dict = {
            'faq_id' : data['faq_id'],
            'answer_id' : data['answer_id'],
            'user': data['user'],
            'score' : 1,
        }
        faq_data.update_score(score_dict)
    except Exception as e :
        score_dict = {"error" : e.__class__.__name__ + ":" +e.args[0]}
    return jsonify(score_dict)
# 對FAQ按倒讚
@faq_api.route('/dislike_faq_post', methods=['POST'])
def dislike_faq_post():
    data = request.get_json()
    try:
        score_dict = {
            'faq_id' : data['faq_id'],
            'answer_id' : data['answer_id'],
            'user': data['user'],
            'score' : -1,
        }
        faq_data.update_score(score_dict)
    except Exception as e :
        score_dict = {"error" : e.__class__.__name__ + ":" +e.args[0]}
    return jsonify(score_dict)
# 新增answer
@faq_api.route('/insert_faq_answer', methods=['POST'])
def insert_faq_answer():
    data = request.get_json()
    try: 
        answer_dict = {
            'faq_id':data['faq_id'],
            'answer_id':"",
            'content':data['content'],
            'edit':data['edit'],
            'vote':int(data['vote']),
            'score':[],
            "_id":""
        }
        if len(data['content']) == 0:
            return jsonify({'message':'FAQ解答內容不得為空 !'})
        faq_data.insert_answer(answer_dict)
    except Exception as e :
        answer_dict = {"error" : e.__class__.__name__ + " : " +e.args[0]}
    return jsonify({"message":"更新成功"})
# 編輯單個answer
@faq_api.route('/update_faq_answer', methods=['POST'])
def update_faq_answer():
    data = request.get_json()
    try: 
        answer_dict = {
            'faq_id':data['faq_id'],
            'answer_id':data['answer_id'],
            'content':data['content'],
            'edit':data['edit'],
            'vote':int(data['vote']),
        }
        if len(data['content']) == 0:
            return jsonify({'message':'FAQ解答內容不得為空 !'})
        faq_data.update_answer(answer_dict)
    except Exception as e :
        answer_dict = {"error" : e.__class__.__name__ + " : " +e.args[0]}
    return jsonify({"message":"更新成功"})
# 刪除單個answer
@faq_api.route('/delete_faq_answer', methods=['POST'])
def delete_faq_answer():
    data = request.get_json()
    try: 
        answer_dict = {
            'faq_id':data['faq_id'],
            'answer_id':data['answer_id']
        }
        faq_data.remove_answer(answer_dict)
    except Exception as e :
        answer_dict = {"error" : e.__class__.__name__ + " : " +e.args[0]}
    return jsonify({"message":"更新成功"})
# 編輯單篇FAQ
@faq_api.route('/update_faq_post', methods=['POST'])
def update_faq_post():
    data = request.get_json()
    try: 
        # 呼叫文字分析模組進行分析
        textAnalyzer = TextAnalyze()
        # 去除code
        target_content = re.sub(r'<pre>.*?</pre>', ' ', data['question']['content'].replace('\n', '').replace('\r', ''))
        data.update({'keywords' : textAnalyzer.contentPreProcess(target_content)[0]})
        data.update({'time': datetime.now().replace(microsecond=0)})
        if len(data['question']['content']) == 0 or len(data['question']['title'])==0:
            return jsonify({'message':'FAQ標題或內容不得為空 !'})
        faq_data.update_faq(data)
    except Exception as e :
        data = {"error" : e.__class__.__name__ + " : " +e.args[0]}
    return jsonify({"message":"更新成功"})

# 刪除單篇FAQ
@faq_api.route('delete_faq_post', methods=['POST'])
def delete_faq_post():
    data = request.get_json()
    try: 
        faq_data.remove_faq(data['_id'])
    except Exception as e :
        data = {"error" : e.__class__.__name__ + " : " +e.args[0]}
    return jsonify({"message":"更新成功"})


UPLOAD_FOLDER = "/home/bach/PSAbot-vm/static/images/user_img"
# UPLOAD_FOLDER = "/Users/jacknahu/Documents/GitHub/PQAbot/static/images/user_img"

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

ALLOWED_EXTENSIONS = {'json'}

#判斷檔案類型
def allowed_file(filename):
    return '.' in filename and \
            filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@faq_api.route('/import_faq_post', methods=['POST'])
def import_faq_post():
    # check if the post request has the file part
    if 'faq' not in request.files:
          flash('No file part')
          return redirect(request.url)
    file = request.files['faq']
    # if user does not select file, browser also submit an empty part without filename
    try:
        if file.filename == '':
            flash('No selected file')
            return redirect(request.url)
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            json_url = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            # 存檔案
            file.save(json_url)
            data_list = json.load(open(json_url,'r',encoding='utf-8'))
            new_data = process_import_data(data_list)
            # 刪除檔案
            os.remove(json_url)
            return jsonify({"message":"更新成功"})
        else:
            flash('Please upload a .json file.')
            return jsonify({'message':'Invalid file type.'})
    except Exception as e :
        return jsonify({'message':e})

def process_import_data(data_list):
    textAnalyzer = TextAnalyze()
    faq_list = [
            {
                "_id" : "",          
                "link" : faq['link'],         
                "question" : 
                {
                    "id" : "",       
                    "title" : faq['question']['title'],    
                    "content": faq['question']['content'],   
                    "edit": "", 
                    "vote" : int(faq['question']['vote']),      
                    "score" : [],
                },
                "answers" : 
                [
                    {       
                        "answer_id" : "",       
                        "content" : a['content'],
                        "edit" : "",
                        "vote" : int(a['vote']),     
                        "score" : []
                    } for a in faq['answers']
                ],
                "keywords" : textAnalyzer.contentPreProcess(re.sub(r'<pre>.*?</pre>', ' ', faq['question']['content'].replace('\n', '').replace('\r', '')))[0],     
                "tags" : [],
                "time" : datetime.now().replace(microsecond=0),
                "view_count" : 0
            } for faq in data_list
    ]
    faq_data.import_faq(faq_list,'inner_faq')
    return faq_list
