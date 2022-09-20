''' =========== USER_COLLECTION =========== *
- 新增資料 : insert_資料名稱
- 取得資料 : query_資料名稱
- 刪除資料 : remove_資料名稱
- 資料名稱統一，以底線分隔
- 使用collection : _db.USER_COLLECTION
* ========================================'''

from . import _db
from .RsaTool import RsaTool
from datetime import datetime, timedelta

# 新增 user
def insert_user(user_dict):
    rsatool = RsaTool()
    user_dict['name'] = rsatool.encrypt(user_dict['name'])
    user_dict['email'] = rsatool.encrypt(user_dict['email'])
    if 'password' in user_dict.keys():
        user_dict['password'] = rsatool.encrypt(user_dict['password'])
    _db.USER_COLLECTION.insert_one(user_dict)
    

# 查詢 user
def query_user(user_id):
    # 使用者發文紀錄/回覆紀錄更新(怕呼叫太多次 先拿掉)
    update_post_list(user_id)
    update_response_list(user_id)
    target_user = _db.USER_COLLECTION.find_one({'_id':user_id})
    if target_user != None:
        # -------- 資料解密 --------- #
        rsatool = RsaTool()
        target_user['email'] = rsatool.decrypt(target_user['email'])
        target_user['name'] = rsatool.decrypt(target_user['name'])
        if 'password' in target_user.keys():
            target_user['password'] = rsatool.decrypt(target_user['password'])
    # -------------------------- #
    return target_user

# 編輯使用者資料
def update_user(update_dict):
    new_name = update_dict['name']
    # -------- 資料加密 --------- #
    rsatool = RsaTool()
    new_name = rsatool.encrypt(update_dict['name'])
    # --------------------------- #
    user_data = _db.USER_COLLECTION.find_one({'_id':update_dict['_id']})
    _db.USER_COLLECTION.update_one({'_id':update_dict['_id']},{'$set':{'name': new_name}})
    # 更改所有發過文的名字
    if len(update_dict['name']) != 0:
        for post in user_data['record']['posts']:
            _db.INNER_POST_COLLECTION.update_one({'_id':post['_id']},{'$set':{'asker_name':update_dict['name']}})
        # 更改所有回覆的名字
        for post in user_data['record']['responses']:
            _db.INNER_POST_COLLECTION.update({'_id':post['_id']},
                                             {'$set':{'answer.$[elem].replier_name':update_dict['name']}},
                                             {'arrayFilters': [{ "elem.replier_id": update_dict['_id']}]},multi=True)

# 增加使用者特定tag一般積分
def update_user_score(user_id,tag_id,tag_name,score):
    # 若使用者沒有該技能，新增該技能
    if _db.USER_COLLECTION.find_one({'_id':user_id,'skill.tag_id': tag_id}) == None:
        tag_data = {
            'tag_id' : tag_id,
            'skill_name' : tag_name,
            'interested_score' : 0,
            'score' : score
        }
        _db.USER_COLLECTION.update_one({'_id':user_id},{'$push':{'skill':tag_data }})
    # 使用者持有該技能，技能積分增加
    else:
        _db.USER_COLLECTION.update_one({'_id':user_id,'skill.tag_id': tag_id},{'$inc':{'skill.$.score':score }})
        
# 增加使用者特定tag興趣積分    
def update_user_interested_score(user_id,tag_id,tag_name,score):
    # 若使用者沒有該技能，新增該技能
    if _db.USER_COLLECTION.find_one({'_id':user_id,'skill.tag_id': tag_id}) == None:
        tag_data = {
            'tag_id' : tag_id,
            'skill_name' : tag_name,
            'interested_score' : score,
            'score' : 0
        }
        _db.USER_COLLECTION.update_one({'_id':user_id},{'$push':{'skill':tag_data }})
    # 使用者持有該技能，技能積分增加
    else:
        _db.USER_COLLECTION.update_one({'_id':user_id,'skill.tag_id': tag_id},{'$set':{'skill.$.interested_score': score }})
    _db.TAG_COLLECTION.update_one({'_id':tag_id},{'$set':{'recent_use':datetime.now().replace(microsecond=0)},
                                                  '$inc':{'usage_counter':0.5}})
# 更新使用者興趣
def update_user_interest(user_id,tag_list):
    for t in tag_list:
        update_user_interested_score(user_id,t["tag_id"],t["skill_name"],t["interested_score"])
        
# 更新使用者發文紀錄
def update_post_list(user_id):
    post_list = [doc for doc in _db.INNER_POST_COLLECTION.aggregate([{'$match': {'asker_id': user_id}}, 
                                                                       {'$project': {'_id': 1, 'title': 1,'asker_name':1,'incognito':1, 'time': 1, 'tag': 1,'asker_id': 1,'icognito': 1, 'score': {'$sum': '$score.score'}}},
                                                                       {'$sort': {'time': -1}}])]
    _db.USER_COLLECTION.update_one({'_id':user_id},{'$set':{'record.posts':post_list}})

# 更新使用者回覆紀錄
def update_response_list(replier_id):
    response_list = [doc for doc in _db.INNER_POST_COLLECTION.aggregate([{'$match': {'answer.replier_id': replier_id}}, 
                                                                       {'$project': {'_id': 1, 'title': 1, 'asker_name':1,'incognito':1,'time': 1, 'tag': 1,'asker_id': 1,'icognito': 1, 'score': {'$sum': '$score.score'}}},
                                                                       {'$sort': {'time': -1}}])]
    _db.USER_COLLECTION.update_one({'_id':replier_id},{'$set':{'record.responses':response_list}})   

"""緗"""
#新增貼文回覆通知
def update_notification_add_post(user_id, replier_id, post_id):
    if _db.USER_COLLECTION.find_one({'_id':user_id}) == None:
        count = 0
    else:
        count = [i['count'] for i in _db.USER_COLLECTION.aggregate([
        {
            '$match': {
                '_id': user_id
            }
        }, {
            '$project': {
                'count': {
                    '$size': '$notification'
                }
            }
        }
    ])][0]
    
#    print("count: "+str(count))
    
    _db.USER_COLLECTION.update_one({'_id':user_id}, {'$push':{'notification':{
                        'id':count+1,
                        'time': datetime.now(),
                        'detail':{
                            'post_id': post_id,
                            'replier_id': replier_id
                       },
                       'new': True,
                       'check': False,
                       'type': "post"
                    },
                },
            })

#新增共同討論通知
def update_notification_add_discussion(asker_id, tags, user_id, room_id, incognito, question):
    if _db.USER_COLLECTION.find_one({'_id':user_id}) == None:
        count = 0
    else:
        count = [i['count'] for i in _db.USER_COLLECTION.aggregate([
        {
            '$match': {
                '_id': user_id
            }
        }, {
            '$project': {
                'count': {
                    '$size': '$notification'
                }
            }
        }
    ])][0]
    
    _db.USER_COLLECTION.update_one({'_id':user_id}, {'$push':{'notification':{
                        'id':count+1,
                        'time': datetime.now(),
                        'detail':{
                            'asker_id': asker_id,
                            'tag': tags,
                            'valid': True,
                            'room_id': room_id,
                            'incognito': incognito,
                            'question': question
                       },
                       'new': True,
                       'check': False,
                       'type': "discussion"
                    },
                },
            })
            
#檢查是否有新通知
def query_notification(user_id):
    return _db.USER_COLLECTION.find_one({'_id':user_id})
    
#new全設false
def update_notification_new(user_id, id):
    _db.USER_COLLECTION.update_one(
        {'_id':user_id},
        { '$set': { "notification.$[element].new" : False } },
        upsert=True,
        array_filters=[ { "element.id": { '$in': id } } ]
    )
    
#依頁數查看通知
def query_notification_by_page(user_id, page):
    return [{'id':i['notification']['id'], 'time':i['notification']['time']+timedelta(hours=8), 'detail':i['notification']['detail'], 'new':i['notification']['new'], 'check':i['notification']['check'], 'type':i['notification']['type']} for i in _db.USER_COLLECTION.aggregate([
    {
        '$match': {
            '_id': user_id
        }
    }, {
        '$unwind': {
            'path': '$notification'
        }
    }, {
        '$sort': {
            'notification.time': -1,
            'id': -1
        }
    }, {
        '$skip': page * 5
    }, {
        '$limit': 5
    }
])]
    
#更新check
def update_notification_check(user_id, id):
    _db.USER_COLLECTION.update_one({'_id':user_id, 'notification.id': id},
    { '$set': { 'notification.$.check' : True } })

#刪除通知
def update_notification_delete(post_id):
    _db.USER_COLLECTION.update_many({}, {'$pull':{'notification':{'detail.post_id':post_id}}})
    
#共同討論初步篩選
def query_skill_discussion_initial_filter(tag_array):
    return [{'_id':i['_id'], 'skill':i['skill']} for i in _db.USER_COLLECTION.aggregate([
    {
        '$unwind': {
            'path': '$skill',
            'preserveNullAndEmptyArrays': False
        }
    }, {
        '$match': {
            'skill.tag_id': {
                '$in': tag_array
            }
        }
    }, {
        '$group': {
            '_id': '$_id',
            'match_count': {
                '$sum': 1
            },
            'skill': {
                '$push': '$skill'
            }
        }
    }, {
        '$match': {
            'match_count': {
                '$gte': len(tag_array)/2
            }
        }
    }
])]

#共同討論只看總積分
def query_skill_discussion_scores_only(exclude_id_array, tag_array, lacking_num):
    return [i['_id'] for i in _db.USER_COLLECTION.aggregate([
    {
        '$match': {
            '_id': {
                '$nin': exclude_id_array
            }
        }
    }, {
        '$unwind': {
            'path': '$skill',
            'preserveNullAndEmptyArrays': False
        }
    }, {
        '$match': {
            'skill.tag_id': {
                '$in': tag_array
            }
        }
    }, {
        '$group': {
            '_id': '$_id',
            'skill': {
                '$push': '$skill'
            },
            'sort_scores': {
                '$sum': {
                    '$add': [
                        '$skill.score', '$skill.interested_score'
                    ]
                }
            }
        }
    }, {
        '$sort': {
            'sort_scores': -1
        }
    }, {
        '$limit': lacking_num
    }
])]

#共同討論邀請失效
def upudate_notification_disable_discussion_invatation(user_id, index):
    _db.USER_COLLECTION.update_one({'_id':user_id, 'notification.id': id},
    { '$set': { 'notification.$.detail.valid' : False } })
""" """
