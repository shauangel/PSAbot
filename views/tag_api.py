#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Thu Jun 24 15:24:03 2021

@author: linxiangling
"""

from flask import Blueprint, jsonify, request
from models import tag, user

tag_api=Blueprint('tag_api', __name__)

@tag_api.route('build_initial_tag', methods=['get'])
def build_initial_tag():
    first_level_tag_name = 'Python'
    second_level_tag_name = ['Web Crawling / Data Mining', 'Web frameworks', 'NLP', 'game development', 'standard libraries', 'GUI', 'Data processing']
    #third_level_tag_name
    Web_Crawing_Data_Mining = ['Requests', 'LXML', 'BeautifulSoup', 'Selenium', 'Scrapy', 'urlib2', 'PySpider', 'MechanicalSoup']
    NLP = ['NLTK', 'TextBlob', 'CoreNLP', 'Gensim', 'spaCy', 'polyglot', 'Pattern', 'PyNLPI', 'SciKit-Learn', 'jieba', 'monpa', 'Vocabulary', 'Quepy']
    GUI = ['Tkinter', 'wxPython', 'Kivy', 'Libavg', 'pyQT', 'PySimpleGUI', 'Pyforms', 'Wax', 'PySide']
    Web_frameworks = ['Django', 'Pyramid', 'TurboGears', 'Tornado', 'web2py', 'Zope', 'Flask', 'Bottle', 'CherrPy', 'Falcon', 'Hug', 'Grok', 'BlueBream', 'Quixote']
    game_development = ['Pygame', 'PyKyra', 'Pyglet', 'PyOpenGL', 'Panda3D', 'Cocos2d', 'Python-Ogre', 'Ren\'Py']
    Data_Processing = ['NumPy', 'SciPy', 'Pandas', 'Keras', 'SciKit-Learn', 'PyTorch', 'TensorFlow', 'XGBoost', 'matplotlib', 'Seaborn', 'Bokeh', 'Plotly', 'pydot', 'Statsmodels']
    standard_libraries = []
    third_level_tag_name=[Web_Crawing_Data_Mining, Web_frameworks, NLP, game_development, standard_libraries, GUI, Data_Processing]
    
    
    first_level_dict = {'id':'', 'name':first_level_tag_name, 'level':0}
    second_level_dict = [{'id':'', 'name':i, 'level':1} for i in second_level_tag_name]
    third_level_dict = [[{'id':'', 'name':i, 'level':2} for i in j] for j in third_level_tag_name]
    
    #建立第一層
    tag_id = tag.insert_tag(first_level_dict['name'], first_level_dict['level'])
    first_level_dict['id'] = tag_id

    #建立第二層
    for i in second_level_dict:
        tag_id = tag.insert_tag(i['name'], i['level'])
        i['id'] = tag_id
        tag.add_child_tag(first_level_dict['id'], first_level_dict['name'], tag_id, i['name'])

    #建立第三層
    index=0
    for i in third_level_dict:
        for j in i:
            print(second_level_dict[index]['id'])
            tag_id = tag.insert_tag(j['name'], j['level'])
            j['id'] = tag_id
            tag.add_child_tag(second_level_dict[index]['id'], second_level_dict[index]['name'], tag_id, j['name'])
        index+=1
            
    return jsonify({'message':'success'})
        
   
#回傳該user的skill name, score, parent id
@tag_api.route('query_user_tag', methods=['get'])
def query_user_tag():
    user_id=request.values.get('user_id')
    user_skill=user.query_user(user_id)['skill']
    tag_info=[]
    for i in user_skill:
        tag_data=tag.query_tag(i['tag_id'])
        tag_info.append({'tag_name':i['skill_name'], 'score':i['score']+i['interested_score'], 'parent':tag_data['parent']})
    return jsonify({'tag_info':tag_info})
    
#回傳該 tag 的 name
@tag_api.route('query_tag_name', methods=['get'])
def query_tag_name():
    tag_id=request.values.get('tag_id')
    tag_name=tag.query_tag(tag_id)['tag']
    return jsonify({'tag_name':tag_name})
    
#回傳該 tag 的 child
@tag_api.route('query_tag_child', methods=['get'])
def query_tag_child():
    tag_id=request.values.get('tag_id')
    tag_child=tag.query_tag(tag_id)['child']
    return jsonify({'tag_child':tag_child})
    
    
   
#回傳所有語言
@tag_api.route('query_all_languages', methods=['get'])
def query_all_languages():
    return jsonify({'tags':tag.query_all_languages()})

#回傳各語言小孩
@tag_api.route('query_all_offspring_tag', methods=['get'])
def query_all_offspring_tag():
    tag_id=request.values.get('tag_id')
    offspring=[]
    associated=[]
    second_level = tag.query_childs(tag_id)
    third_level=[]
    #print(second_level)
    for i in range(len(second_level)):
        second_level_child=tag.query_childs(second_level[i]['tag_id'])
        third_level.extend(second_level_child)
        #加入第二層關聯標籤
        second_level_associated=tag.query_associated(second_level[i]['tag_id'])
        if second_level_associated:
            associated.append(second_level_associated)
        #associated.append(tag.query_associated(second_level[i]['tag_id']))
        for j in second_level_child:
            #加入第三層關聯標籤
            third_level_associated=tag.query_associated(j['tag_id'])
            if third_level_associated:
                associated.append(third_level_associated)
    offspring.extend(second_level)
    offspring.extend(third_level)
    offspring.extend(associated)
    
    print(offspring)
    return jsonify({'tags':offspring})
    
#更新使用次數與時間

