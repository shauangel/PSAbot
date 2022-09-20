#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Tue Apr  6 23:33:52 2021

@author: linxiangling
"""

from flask import Blueprint, render_template

exchange_web=Blueprint('exchange_web', __name__)

@exchange_web.route("/exchange")
def exchange():
    return render_template("index.html")