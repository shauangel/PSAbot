#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Mon Apr 19 19:00:01 2021

@author: linxiangling
"""
from datetime import datetime
import requests 
import json
import flask
from flask import request, Blueprint, jsonify
from models import user,chat_data, tag

discussion_api=Blueprint('discussion_api', __name__)

#head_url='http://localhost:55001/api/'
head_url='https://soselab.asuscomm.com:55002/api/'

#共同討論推薦user
@discussion_api.route('discussion_recommand_user', methods=['POST'])
def discussion_recommand_user():
    #first_level = requests.get(head_url + 'query_all_languages')
    all_level_tag=tag.query_all_level_tag_array()
    first_level=all_level_tag['first_level']
    second_level=all_level_tag['second_level']
    third_level=all_level_tag['third_level']
    
    data = request.get_json()
    tags = data['tags']
    #初步篩選
    users = user.query_skill_discussion_initial_filter(tags)
    #加權
    for i in users:
        sort_scores = 0
        for j in i['skill']:
            if j['tag_id'] in first_level:
                sort_scores += (j['interested_score']+j['score']) * 1
            elif j['tag_id'] in second_level:
                sort_scores += (j['interested_score']+j['score']) * 3
            elif j['tag_id'] in third_level:
                sort_scores += (j['interested_score']+j['score']) * 5
        i.update({'sort_scores':sort_scores})
    #排序
    sorted_users = sorted(users, key=lambda k: k['sort_scores'], reverse=True)
    stage1_id_array = [i['_id'] for i in sorted_users]
    #print("stage1_id_array ", stage1_id_array)
    #print('sorted_users ', sorted_users)
    #不足十人，找更多人推薦
    if len(users) < 10:
        lacking_num = 10 - len(users)
        stage2_id_array = user.query_skill_discussion_scores_only(stage1_id_array, tags, lacking_num)
        #print("stage2_id_array ", stage2_id_array)
        stage1_id_array.extend(stage2_id_array)
    else:
        stage1_id_array = stage1_id_array[0:10]
    return jsonify({"recommand_user_id":stage1_id_array})
    
''' --------- ditto's code --------- '''
# 詢問機器人建立聊天室
@discussion_api.route('/create_psabot_chat', methods=['POST'])
def create_psabot_chat():
    data = request.get_json()
    chat_dict = {
        '_id':'',
        'psabot_room_id': data['user_id'],
        'chat_logs':[],
    }
    chat_data.insert_psabot_chat(chat_dict)
    return jsonify({'message':'新增成功'})

# 詢問機器人儲存聊天訊息
@discussion_api.route('/insert_psabot_message', methods=['POST'])
def insert_psabot_message():
    data = request.get_json()
    chat_dict = {
        'user_id':data['user_id'],
        'is_bot':data['is_bot'],
        'time':datetime.now().replace(microsecond=0),
        'type':data['type'],
        'content':data['content']
    }
    chat_data.insert_psabot_message(chat_dict)
    return jsonify({'message':'新增成功'})


# 聊天室是否額滿
@discussion_api.route('/check_discussion_is_full', methods=['POST'])
def check_discussion_is_full():
    data = request.get_json()
    chat_dict = chat_data.query_chat(data['room_id'])
    if chat_dict != None:
        if len(chat_dict['members']) >1:
            return jsonify(True)
        else:
            return jsonify(False)
    else:
        return jsonify({"error" : 'room ID ' + data['room_id'] + ' does not exist.'})
    
# 使用者是否匿名
@discussion_api.route('/check_member_is_incognito', methods=['POST'])
def check_member_is_incognito():
    data = request.get_json()
    for member in chat_data.query_chat(data['room_id'])['members']:
        if member['user_id'] == data['user_id']:
            return jsonify(member['incognito'])
    return jsonify({'error':'user '+ data['user_id'] + 'does not exist in room ' + data['room_id']})

# 調整聊天室狀態
@discussion_api.route('/change_chat_state', methods=['POST'])
def change_chat_state():
    data = request.get_json()
    chat_data.change_state(data['room_id'],data['state'])
    return jsonify(data)

# 取得使用者所有聊天室
@discussion_api.route('/query_chat_list', methods=['POST'])
def query_chat_list():
    data = request.get_json()
    chat_list = chat_data.query_room_list(data['user_id'])
    return jsonify(chat_list)

# 刪除聊天室資料
@discussion_api.route('/remove_chat', methods=['POST'])
def remove_chat():
    data = request.get_json()
    chat_data.remove_chat(data)
    return jsonify({"message":"更新成功"})

# 取得聊天室tag
@discussion_api.route('/query_chat_tag', methods=['POST'])
def query_chat_tag():
    data = request.get_json()
    tags = chat_data.query_chat(data['_id'])['tags']
    return jsonify(tags)
    
@discussion_api.route('/query_chat', methods=['POST'])
def query_chat():
    data = request.get_json()
    chat_dict = chat_data.query_chat(data['_id'])
    return jsonify(chat_dict)
