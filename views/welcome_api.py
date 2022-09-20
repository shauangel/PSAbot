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


welcome_api=Blueprint('welcome_api', __name__)
@welcome_api.route('welcome')
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

@welcome_api.route('session_start')
def session_start():
    sender_id=request.values.get('sender_id')
    print('sender_id'+sender_id)
    payload = {'sender': sender_id, 'message': '/session_start'}
    headers = {'content-type': 'application/json'}
    r = requests.post('http://localhost:5005/webhooks/rest/webhook', json=payload, headers=headers)
    print(r.json())
    return jsonify({"message":"session_start success"})
    
#ask_os_api=Blueprint('ask_os_api', __name__)
#@ask_os_api.route('ask_os')
#def ask_os():
#    payload = {'sender': 'user', 'message': 'ask_os'}
#    headers = {'content-type': 'application/json'}
#    r = requests.post('http://localhost:5005/webhooks/rest/webhook', json=payload, headers=headers)
#    print(r.json())
#    return r.json()[0]
