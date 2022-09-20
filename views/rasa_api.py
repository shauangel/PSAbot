#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Mon Apr 19 19:00:01 2021

@author: linxiangling
"""

import requests 
import json
import flask
from flask import request, Blueprint, jsonify

#為了主動觸發custom action
rasa_api=Blueprint('rasa_api', __name__)
@rasa_api.route('welcome')
def welcome():
    sender_id=request.values.get('sender_id')
    print('sender_id'+sender_id)
    payload = {'sender': sender_id, 'message': 'start'}
    headers = {'content-type': 'application/json'}
    r = requests.post('http://localhost:5005/webhooks/rest/webhook', json=payload, headers=headers)
    print(r.json())
    if len(r.json()) == 0:
        return jsonify({"message":"no triggered intent"})
    else:
        return r.json()[0]

#為了主動觸發custom action
@rasa_api.route('session_start')
def session_start():
    sender_id=request.values.get('sender_id')
    print('sender_id'+sender_id)
    payload = {'sender': sender_id, 'message': '/session_start'}
    headers = {'content-type': 'application/json'}
    r = requests.post('http://localhost:5005/webhooks/rest/webhook', json=payload, headers=headers)
    print(r.json())
    return jsonify({"message":"session_start success"})
    
@rasa_api.route('keywords')
def keywords():
    sender_id=request.values.get('sender_id')
    keywords=request.values.get('keywords')
    #print('sender_id'+sender_id)
    payload = {'sender': sender_id, 'message': keywords}
    headers = {'content-type': 'application/json'}
    r = requests.post('http://localhost:5005/webhooks/rest/webhook', json=payload, headers=headers)
    print('keywords json: ', r.json()[0])
    return r.json()[0]
    
#ask_os_api=Blueprint('ask_os_api', __name__)
#@ask_os_api.route('ask_os')
#def ask_os():
#    payload = {'sender': 'user', 'message': 'ask_os'}
#    headers = {'content-type': 'application/json'}
#    r = requests.post('http://localhost:5005/webhooks/rest/webhook', json=payload, headers=headers)
#    print(r.json())
#    return r.json()[0]

