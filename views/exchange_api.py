#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Tue Apr  6 23:03:25 2021

@author: linxiangling
"""

import requests 
import json
import flask
from flask import request, Blueprint, jsonify

#payload = {'sender': 'user', 'message': 'NT 1000'}
#headers = {'content-type': 'application/json'}
#r = requests.post('http://localhost:5005/webhooks/rest/webhook', json=payload, headers=headers)
#print(r.json())

exchange_api=Blueprint('exchange_api', __name__)
@exchange_api.route('exchange')
def exchange():
    NTinput=request.values.get('message')
    payload = {'sender': 'user', 'message': NTinput}
    headers = {'content-type': 'application/json'}
    r = requests.post('http://localhost:5005/webhooks/rest/webhook', json=payload, headers=headers)
    print(r.json())
    return r.json()[0]