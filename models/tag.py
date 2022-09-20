#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Fri Apr 23 21:52:20 2021

@author: linxiangling
"""
from . import _db

#新增 empty tag
def insert_tag(tag_name, level):
    data=_db.TAG_COLLECTION.find()
    if data.count() != 0:
        tag_id=str(int(data.sort('_id', -1)[0]['_id'])+1).zfill(5)
    else:
        tag_id='00000'
    tag_dict = {'_id':tag_id, 'tag':tag_name, 'child':[], 'parent':'', 'associated':[], 'usage_counter':0, 'recent_use':'', 'level':level}
    _db.TAG_COLLECTION.insert_one(tag_dict)
    return tag_id
    
#新增 child tag
def add_child_tag(parent_id, parent_name, child_id, child_name):
    _db.TAG_COLLECTION.update({'_id':parent_id}, {'$push':{'child':{'tag_id':child_id, 'tag_name':child_name}}})
    _db.TAG_COLLECTION.update({'_id':child_id}, {'$set':{'parent':{'tag_id':parent_id, 'tag_name':parent_name}}})
    
#新增 associated tag (parent)
def add_child_associated(associate_tuple, associated_tag_id):
    _db.TAG_COLLECTION.update({'_id':associate_tuple[2]}, {'$push':{'associated':{'tag_id':associated_tag_id, 'tag_name':associate_tuple[1]}}})
    
#查詢 tag
def query_tag(tag_id):
    return _db.TAG_COLLECTION.find_one({'_id':tag_id})


#所有語言 tag
def query_all_languages():
    tags = [{'_id':i['_id'], 'tag':i['tag']} for i in _db.TAG_COLLECTION.find({'parent':''})]
    return tags
    
#回傳 child, child 含 tag_name, tad_id
def query_childs(tag_id):
    tags = _db.TAG_COLLECTION.find_one({'_id':tag_id})['child']
    return tags
    
#回傳 associated
def query_associated(tag_id):
    associated = _db.TAG_COLLECTION.find_one({'_id':tag_id})['associated']
    return associated
    

#回傳 tag name, id
def query_tag_name_id_child(tag_id):
    tag = _db.TAG_COLLECTION.find_one({'_id':tag_id})
    return {'tag_name':tag['tag'], 'tag_id':tag['_id'], 'child':tag['child']}

#取得各層級tag陣列
def query_all_level_tag_array():
    first_level=[i['_id'] for i in _db.TAG_COLLECTION.find({'level':0})]
    second_level=[i['_id'] for i in _db.TAG_COLLECTION.find({'level':1})]
    third_level=[i['_id'] for i in _db.TAG_COLLECTION.find({'level':2})]
    return {'first_level':first_level, 'second_level':second_level, 'third_level':third_level}
    
#取得第一階層tag_name
def query_first_level_tag_name():
    return [i['tag'] for i in _db.TAG_COLLECTION.find({'level':0})]
    
    
#新增empty associated tag (自己)
def add_new_associated_tag(associate_tuple):
    data=_db.TAG_COLLECTION.find()
    if data.count() != 0:
        tag_id=str(int(data.sort('_id', -1)[0]['_id'])+1).zfill(5)
    else:
        tag_id='00000'
    #parent=_db.TAG_COLLECTION.find_one({'tag':associate_tuple[0]})
    associated_tag_dict={'_id':tag_id, 'tag':associate_tuple[1], 'child':"", 'parent':{'tag_id':associate_tuple[2], 'tag_name':associate_tuple[0]}, 'associated':[], 'usage_counter':0, 'recent_use':"", 'level':-1}
    _db.TAG_COLLECTION.insert_one(associated_tag_dict)
    return tag_id
