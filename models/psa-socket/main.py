# -*- coding: utf-8 -*-
"""
Created on Wed Sep  1 16:38:24 2021

@author: jacknahu
"""

from flask import Flask, request
from flask_socketio import SocketIO, emit, join_room, rooms
from os import urandom
from datetime import datetime
import chat_data
import requests,re

app = Flask(__name__)
app.config['SECRET_KEY'] = urandom(24).hex()
socketio = SocketIO()
socketio.init_app(app,cors_allowed_origins='*')


# client連線
@socketio.on('connect')
def connect():
    print('# ---------- trigger connect event ...')
    # 加入使用者個人房間
    user_id = request.args.get('user_id')
    room_list = chat_data.query_room_list(user_id)
    for room in room_list:
        if room['enabled']:
            join_room(room['_id'])
    join_room(user_id)
    print('client\'s rooms : ' , rooms())
    emit('connect', user_id + ' has connected.',to=user_id)

# 解除連線
@socketio.on('disconnect')
def disconnect():
    print('# ---------- trigger disconnect event ...')
    # 加入使用者個人房間
    
# 傳送問題資訊並建立聊天室
@socketio.on('create_room')
def create_room(data):
    # data: {'question':'',tags:[],'asker':{'user_id':'','user_name':'','incognito':''}}
    print('# ---------- client emit create_room ...')
    print('client send data : ',data)
    chat_dict = {
        '_id':'',
        'tags': data['tags'],
        'keywords': [],
        'question': data['question'],
        'time':datetime.now().replace(microsecond=0),
        'members': 
        [
            {
            'user_id':data['asker']['user_id'],
            'incognito':data['asker']['incognito']
            }
        ],
        'chat_logs':[],
        'end_flag':False,
        'enabled':True
    }
    room_id = chat_data.insert_chat(chat_dict)
    # 將發問者加入聊天室
    join_room(room_id)
    print('new room id : ' + room_id)
    print('client\'s rooms : ' , rooms())
    emit('received_message', {'_id':room_id}, to=data['asker']['user_id'])
    print('# ---------- server emit room id to client ...')
    print('server send data : ',{'_id':room_id})
    join_message = {
            '_id':room_id,
            'user_id': 'PSAbot',
            'time': datetime.now().replace(microsecond=0),
            'type':'string',
            'content':'等待回答者加入...'
    }
    chat_data.insert_message(join_message)
    join_message['time'] = str(join_message['time'])
    emit('received_message', join_message, to=room_id)
    print('# ---------- server emit join_message to chat room ' + room_id +' ...')
    print('server send data : ',join_message)
    

# 使用者加入聊天室
@socketio.on('join_room')
def join_chat_room(data):
    print('# ---------- client emit join_room ...')
    print('client send data : ',data)
    # data : { '_id','user_id','incognito'}
    question = chat_data.query_chat(data['_id'])['question']
    chat_data.insert_member(data)
    join_room(data['_id'])
    join_message = {
            '_id':data['_id'],
            'user_id': 'PSAbot',
            'time': datetime.now().replace(microsecond=0),
            'type':'string',
            'content':'本次共同討論的問題是「 '+ question +'」，可以開始討論了。討論結束後請發問者輸入「結束討論」完成本次討論。'
    }
    chat_data.insert_message(join_message)
    join_message['time'] = str(join_message['time'])
    emit('received_message', join_message, to=data['_id'])
    print('# ---------- server emit join_message to chat room ' + data['_id'] +' ...')
    print('server send data : ',join_message)

@socketio.on('send_message')
def send_message(data):
    print('# ---------- client emit send_message ...')
    print('client send data : ',data)
    # 如果該client有在
    if data['_id'] in rooms():   
        # data : { '_id','user_id','time','type','content'}
        chat_dict = {
            '_id':data['_id'],
            'user_id': data['user_id'],
            'time': datetime.now().replace(microsecond=0),
            'type':data['type'],
            'content':data['content']
        }
        chat_data.insert_message(chat_dict)
        chat_dict['time'] = str(chat_dict['time'])
        emit('received_message', chat_dict, to=data['_id'])
        print('# ---------- server emit message to chat room ' + data['_id'] +' ...')
        print('server send data : ',chat_dict)
        # ------------------------------------------------- #
        end_sentences = ['結束討論','結束共同討論','完成討論']
        match = re.match(r'psabot ',chat_dict['content'],flags=re.IGNORECASE)
        if match != None and match.span()[0] == 0: # 若是psabot開頭，丟給faq_api
            print('# ---------- 傳送訊息給 rasa faq 機器人 ...')
            payload = {'sender':data['user_id'],'message':(re.sub(r'psabot ','',chat_dict['content'],flags=re.IGNORECASE))}
            print(payload)
            headers = {'content-type': 'application/json'}
            r = requests.post('http://localhost:5006/webhooks/rest/webhook', json=payload,headers=headers )
            # msg_tracker = requests.get('http://localhost:5005/conversations/'+ chat_dict['user_id'] + '/tracker')
            # print('tracker :',json.dumps(msg_tracker.json(), indent = 1))
            print('rasa response :',r.json())
            psa_message = {
                        '_id':chat_dict['_id'],
                        'user_id': 'PSAbot',
                        'time': datetime.now().replace(microsecond=0),
                        'type':'string',
                        'content':r.json()[0]['text']
                    }
            chat_data.insert_message(psa_message)
            psa_message['time'] = str(psa_message['time'])
            emit('received_message', psa_message, to=chat_dict['_id'])
            print('# ---------- server emit message to chat room ' + chat_dict['_id'] +' ...')
            print('server send data : ',psa_message)
            
        # 使用者欲結束聊天
        elif chat_dict['content'] in end_sentences:
            print('# ---------- 觸發結束共同討論 ...')
            current_chat = chat_data.query_chat(data['_id'])
            if data['user_id'] == current_chat['members'][0]['user_id']:
                chat_data.end_chat(chat_dict['_id'],True,1)
                replier_id = current_chat['members'][1]['user_id']
                payload = {'sender': chat_dict['user_id'],'message':'end_discuss,' + replier_id+',' + data['_id']}
                print('send request to rasa 5005:',payload)
                headers = {'content-type': 'application/json'}
                r = requests.post('http://localhost:5005/webhooks/rest/webhook', json=payload,headers=headers )
                # msg_tracker = requests.get('http://localhost:5005/conversations/'+ chat_dict['user_id'] + '/tracker')
                # print('tracker :',json.dumps(msg_tracker.json(), indent = 1))
                print('rasa response :',r.json())
                if len(r.json()) == 0:
                    psa_message = {
                        '_id':chat_dict['_id'],
                        'user_id': 'PSAbot',
                        'time': datetime.now().replace(microsecond=0),
                        'type':'string',
                        'content':"no triggered intent"
                    }
                else:
                    psa_message = {
                        '_id':chat_dict['_id'],
                        'user_id': 'PSAbot',
                        'time': datetime.now().replace(microsecond=0),
                        'type':'string',
                        'content':r.json()[0]['text']
                    }
                if len(r.json())!= 0 and r.json()[0]['text'] != 'return_discussion':
                    chat_data.insert_message(psa_message)
                psa_message['time'] = str(psa_message['time'])
                emit('received_message', psa_message, to=chat_dict['_id'])
                print('# ---------- server emit message to chat room ' + chat_dict['_id'] +' ...')
                print('server send data : ',psa_message)
         # 結束聊天狀態
        elif chat_data.end_chat(chat_dict['_id'],True,0):
            print('# ---------- 結束共同討論狀態中 ...')
            payload = {'sender': chat_dict['user_id'],'message':chat_dict['content']}
            print('send request to rasa 5005:',payload)
            headers = {'content-type': 'application/json'}
            r = requests.post('http://localhost:5005/webhooks/rest/webhook', json=payload,headers=headers)
            # msg_tracker = requests.get('http://localhost:5005/conversations/'+ chat_dict['user_id'] + '/tracker')
            # print('tracker :',json.dumps(msg_tracker.json(), indent = 1))
            print('rasa response :',r.json())
            psa_message = {
                        '_id':chat_dict['_id'],
                        'user_id': 'PSAbot',
                        'time': datetime.now().replace(microsecond=0),
                        'type':'string',
                        'content':r.json()[0]['text']
                    }
            if len(r.json())!= 0 and r.json()[0]['text'] != 'return_discussion':
                chat_data.insert_message(psa_message)
            psa_message['time'] = str(psa_message['time'])
            emit('received_message', psa_message, to=chat_dict['_id'])
            print('# ---------- server emit message to chat room ' + chat_dict['_id'] +' ...')
            print('server send data : ',psa_message)
        
    else:
        emit('received_message',
             {
                 '_id':data['user_id'],
                 'user_id':'PSAbot',
                 'time':str(datetime.now().replace(microsecond=0)),
                 'type':'string',
                 'content':'Client isn\'t in room ' + data['_id'] + ', can\'t send messages.'},to=data['user_id'])


# 取得聊天室歷史訊息
@socketio.on('get_chat')
def get_chat(data):
    chat_dict = chat_data.query_chat(data['_id'])
    # 將聊天紀錄傳給該client的user_id channel
    chat_dict['time'] = str(chat_dict['time'])
    for idx in range(0,len(chat_dict['chat_logs'])):
        chat_dict['chat_logs'][idx]['time'] = str(chat_dict['chat_logs'][idx]['time'])
    emit('received_message',chat_dict,to=data['user_id'])
    print('# ---------- server emit message to client ...')
    print('server send data : ',chat_dict)

if __name__ == "__main__":
    socketio.run(app,host='0.0.0.0',port=55003,debug=True)
