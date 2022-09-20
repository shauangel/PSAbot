# --- flask --- #
from flask import Blueprint, request, jsonify
#from flask_security import logout_user, login_required
import re
# --- our models ---- #
from models import inner_post
from .TextAnalyze import TextAnalyze

from datetime import datetime

post_api = Blueprint('post_api', __name__)

# 依照每頁筆數,頁碼取得貼文摘要
@post_api.route('/query_inner_post_list', methods=['POST'])
def query_inner_post_list():
    data = request.get_json()
    try: 
        list_dict = inner_post.query_post_list(data['page_size'],data['page_number'],data['option'])
        
    except Exception as e :
        list_dict = {"error" : e.__class__.__name__ + " : " +e.args[0]}
    return jsonify(list_dict)

# 依照貼文標題,每頁筆數,頁碼取得貼文摘要
@post_api.route('/query_inner_post_list_by_title', methods=['POST'])
def query_inner_post_list_by_title():
    data = request.get_json()
    try:
        list_dict = inner_post.query_post_list_by_title(data['title'],data['page_size'],data['page_number'],data['option'])
    except Exception as e :
        list_dict = {"error" : e.__class__.__name__ + " : " +e.args[0]}
    return jsonify(list_dict)

# 依照標籤,每頁筆數,頁碼取得貼文摘要
@post_api.route('/query_inner_post_list_by_tag', methods=['POST'])
def query_inner_post_list_by_tag():
    data = request.get_json()
    try:
        list_dict = inner_post.query_post_list_by_tag(data['tag'],data['page_size'],data['page_number'],data['option'])
    except Exception as e :
        list_dict = {"error" : e.__class__.__name__ + " : " +e.args[0]}
    return jsonify(list_dict)

# 新增內部貼文
@post_api.route('/insert_inner_post', methods=['POST'])
def insert_inner_post():
    data = request.get_json()
    try:
        d = {
            '_id' : '',
            'answer' : [],
            'keyword' : [],
            'time' : datetime.now().replace(microsecond=0),
            'score' : [],
            'view_count' : 0
        }
        if len(data['question']) == 0 or len(data['title']) == 0:
            return jsonify({'message': '貼文內容或標題不得為空 !'})
        data.update(d)
        # 呼叫文字分析模組進行分析
        textAnalyzer = TextAnalyze()
        # 去除code
        if "is_discuss" in data and not data['is_discuss']:
            target_content = re.sub(r'<pre>.*?</pre>', ' ', data['question'].replace('\n', '').replace('\r', ''))
            # 取得分析過的關鍵字
            keyword_list = textAnalyzer.contentPreProcess(target_content)[0]
            # 計算出現次數
            # data['keyword'] = [ {"word":k,
            #                      "count":target_content.lower().count(k) } for k in keyword_list ]
            data['keyword'] = keyword_list
        inner_post.insert_post(data)
    except Exception as e :
        data = {"error" : e.__class__.__name__ + ":" +e.args[0]}
    return jsonify({"message":"更新成功"})

# 編輯內部貼文
@post_api.route('/update_inner_post', methods=['POST'])
def update_inner_post():
    data = request.get_json()
    try:
        post_dict = {
            '_id' : data['_id'],
            'asker_id':data['asker_id'],
            'title' : data['title'],
            'question' : data['question'],
            'edit' : data['edit'],
            'keyword' : [],
            'time' : datetime.now().replace(microsecond=0)
        }
        if len(data['question']) == 0 or len(data['title']) == 0:
            return jsonify({'message': '貼文內容或標題不得為空 !'})
        # 呼叫文字分析模組進行分析
        textAnalyzer = TextAnalyze()
        # 去除code
        target_post = inner_post.query_post(data['_id'])
        if "is_discuss" in target_post and not target_post['is_discuss']:
            target_content = re.sub(r'<pre>.*?</pre>', ' ', post_dict['question'].replace('\n', '').replace('\r', ''))
            keyword_list = textAnalyzer.contentPreProcess(target_content)[0]
            # post_dict['keyword'] = [ {"word":k,
            #                           "count":target_content.lower().count(k) } for k in keyword_list ]
            # if type(target_post['keyword'][0]) is dict:
            #     new_keyword_list = [ { k:0 } for k in keyword_list ]
            #     # 若原本有該keyword，要記錄舊的count
            #     for nk in new_keyword_list:
            #         current_key_name = list(nk)[0]
            #         for ok in target_post['keyword']:
            #             if list(ok)[0] == current_key_name:
            #                 nk.update({ current_key_name : list(ok.values())[0] })
            #                 break
            #     post_dict['keyword'] = new_keyword_list
            # else:
            #     post_dict['keyword'] = [ { k:0 } for k in keyword_list ]
            post_dict['keyword'] = keyword_list     
        inner_post.update_post(post_dict)
    except Exception as e :
        post_dict = {"error" : e.__class__.__name__ + ":" +e.args[0]}
    return jsonify({"message":"更新成功"})

# 依貼文_id查看貼文
@post_api.route('/query_inner_post', methods=['POST'])
def query_inner_post():
    data = request.get_json()
    try:
        post_dict = inner_post.query_post(data['_id'])
    except Exception as e :
        post_dict = {"error" : e.__class__.__name__ + ":" +e.args[0]}
    return jsonify(post_dict)

# 新增貼文回覆
@post_api.route('/insert_inner_post_response',methods=['POST'])
def insert_inner_post_response():
    data = request.get_json()
    try:
        response_dict = {
            'post_id' : data['post_id'],
            '_id' : '',
            "replier_id" : data['replier_id'],
            "replier_name" : data['replier_name'],
            "response" : data['response'],
            "edit" : data['edit'],
            "time" : datetime.now().replace(microsecond=0),
            "score":[],
            "incognito":data['incognito']
        }
        if len(data['response']) == 0:
            return jsonify({'message': '回覆內容不得為空 !'})
        inner_post.insert_response(response_dict)
    except Exception as e :
        response_dict = {"error" : e.__class__.__name__ + ":" +e.args[0]}
    return jsonify({"message":"更新成功"})

# 編輯貼文回覆
@post_api.route('/update_inner_post_response',methods=['POST'])
def update_inner_post_response():
    data = request.get_json()
    try:
        response_dict = {
            'post_id' : data['post_id'],
            '_id' : data['_id'],
            "replier_id" : data['replier_id'],
            "response" : data['response'],
            "edit" : data['edit'],
            "time" : datetime.now().replace(microsecond=0)
        }
        if len(data['response']) == 0:
            return jsonify({'message': '回覆內容不得為空 !'})
        inner_post.update_response(response_dict)
    except Exception as e :
        response_dict = {"error" : e.__class__.__name__ + ":" +e.args[0]}  
    return jsonify({"message":"更新成功"})

# 刪除貼文回覆
@post_api.route('/delete_inner_post_response',methods=['POST'])
def delete_inner_post_response():
    data = request.get_json()
    try:
        response_dict = {
            'post_id' : data['post_id'],
            '_id' : data['_id'],
            "replier_id" : data['replier_id'],
        }
        inner_post.remove_response(response_dict)
    except Exception as e :
        response_dict = {"error" : e.__class__.__name__ + ":" +e.args[0]}  
    return jsonify({"message":"更新成功"})

# 對貼文按讚
@post_api.route('/like_inner_post',methods=['POST'])
def like_inner_post():
    data = request.get_json()
    try:
        score_dict = {
            'post_id' : data['post_id'],
            'response_id' : data['response_id'],
            'user':data['user'],
            'score' : 1,
        }
        inner_post.update_score(score_dict)
    except Exception as e :
        score_dict = {"error" : e.__class__.__name__ + ":" +e.args[0]}
    return jsonify(score_dict)

# 對貼文按倒讚
@post_api.route('/dislike_inner_post',methods=['POST'])
def dislike_inner_post():
    data = request.get_json()
    try:
        score_dict = {
            'post_id' : data['post_id'],
            'response_id' : data['response_id'],
            'user':data['user'],
            'score' : -1,
        }
        inner_post.update_score(score_dict)
    except Exception as e :
        score_dict = {"error" : e.__class__.__name__ + ":" +e.args[0]}
    return jsonify(score_dict)

# 刪除貼文
@post_api.route('/delete_inner_post',methods=['POST'])
def delete_inner_post():
    data = request.get_json()
    try: 
        inner_post.remove_post(data['_id'])
    except Exception as e :
        data = {"error" : e.__class__.__name__ + ":" +e.args[0]}
        print(e)
    return jsonify({"message":"更新成功"})

#內部搜尋
@post_api.route('query_inner_search', methods=['POST'])
def query_inner_search():
    data = request.get_json()

    inner_search_result=inner_post.query_inner_search(data['keywords'])
    inner_search_result_dict = {
        'inner_search_result': inner_search_result
    }
    return jsonify(inner_search_result_dict)

#近日熱門貼文
@post_api.route('query_hot_post', methods=['get'])
def query_hot_post():
    return jsonify({"hot_post":inner_post.query_hot_post()})
