#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Mon Apr 19 19:04:59 2021

@author: linxiangling
"""

from flask import Blueprint, render_template
from models.PSAbotLoginManager import roles_required, login_required

base_flow_web=Blueprint('base_flow_web', __name__)

@base_flow_web.route("/base_flow")
def base_flow():
    return render_template("base_flow.html")


@base_flow_web.route("/PSAbot")
def PSAbot():
    return render_template("menuBar.html")

@base_flow_web.route("/Profile")
@login_required
@roles_required('facebook_user', 'google_user')
def Profile():
    return render_template("profile.html")
    
@base_flow_web.route("/profileFrame")
@login_required
@roles_required('facebook_user', 'google_user')
def profileFrame():
    return render_template("profileFrame.html")
    
@base_flow_web.route("postQuestionFrame")
@login_required
@roles_required('facebook_user', 'google_user', 'manager')
def postQuestionFrame():
    return render_template("postQuestionFrame.html")
    
@base_flow_web.route("/replyQuestionFrame")
@login_required
@roles_required('facebook_user', 'google_user', 'manager')
def replyQuestionFrame():
    return render_template("replyQuestionFrame.html")
    
@base_flow_web.route("/mySinglePostFrame")
def mySinglePostFrame():
    return render_template("mySinglePostFrame.html")
    
@base_flow_web.route("/otherSingleFrame")
def otherSingleFrame():
    return render_template("otherSingleFrame.html")

@base_flow_web.route("/postRowFrame")
def postRowFrame():
    return render_template("postRowFrame.html")

@base_flow_web.route("/home")
def homeFrame():
    return render_template("home.html")
    
@base_flow_web.route("/summaryFrame")
def summaryFrame():
    return render_template("summary_new.html")
    
#可以用相對路徑嗎？好像不行
@base_flow_web.route("/skillTreeFrame")
@login_required
@roles_required('facebook_user', 'google_user')
def skillTreeFrame():
    return render_template("example.html")

@base_flow_web.route("/editPostFrame")
@login_required
@roles_required('facebook_user', 'google_user', 'manager')
def editPostFrame():
    return render_template("editPostFrame.html")
    
@base_flow_web.route("/editReplyFrame")
@login_required
@roles_required('facebook_user', 'google_user', 'manager')
def editReplyFrame():
    return render_template("editReplyFrame.html")

@base_flow_web.route("/comprehensive")
@login_required
@roles_required('facebook_user', 'google_user')
def comprehensive():
    return render_template("comprehensive.html")
    
@base_flow_web.route("/summary_new")
@login_required
@roles_required('facebook_user', 'google_user')
def summary_new():
    return render_template("summary_new.html")
    
@base_flow_web.route("/FaqFrame")
def FaqFrame():
    return render_template("FaqFrame.html")

@base_flow_web.route("/manageDataFrame")
@login_required
@roles_required('manager')
def manageDataFrame():
    return render_template("manageDataFrame.html")

@base_flow_web.route("/testsocket")
def testSocketio():
    return render_template("testSocketio.html")
