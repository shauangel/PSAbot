''' ======== INNER_POST_COLLECTION ======== *
- 新增資料 : insert_資料名稱
- 取得資料 : query_資料名稱
- 編輯資料 : update_資料名稱
- 刪除資料 : remove_資料名稱
- 資料名稱統一，以底線分隔，function前加上註解
- 使用collection : _db.INNER_POST_COLLECTION
* ========================================'''
# ====== our models ===== #
from . import _db
from . import user
import re
# ======================= #
from sklearn import preprocessing
from datetime import datetime, timedelta
from collections import defaultdict
from . import tag
# 取得所有貼文列表
def query_post_list(page_size,page_number,option):
    post_count = [i for i in _db.INNER_POST_COLLECTION.aggregate([{'$count': 'post_count'}])][0]['post_count']
    if option == '': # 預設是用時間排
        post_list = [ doc for doc in _db.INNER_POST_COLLECTION.aggregate([{'$project': {'_id': 1, 'title': 1, 'time': 1, 'asker_name': 1, 'incognito':1,'tag': 1,'asker_id': 1,'icognito': 1, 'score': {'$sum': '$score.score'}}}, 
                                                                 {'$sort': {'time': -1}}, 
                                                                 {'$skip': page_size * (page_number - 1)}, 
                                                                 {'$limit': page_size}])]
    else : 
        post_list = [ doc for doc in _db.INNER_POST_COLLECTION.aggregate([{'$project': {'_id': 1, 'title': 1, 'time': 1, 'asker_name': 1, 'incognito':1, 'tag': 1,'asker_id': 1,'icognito': 1, 'score': {'$sum': '$score.score'}}}, 
                                                                 {'$sort': {option : -1}}, 
                                                                 {'$skip': page_size * (page_number - 1)}, 
                                                                 {'$limit': page_size}])]
    return {'post_count' : post_count,'post_list' : post_list}

# 依貼文名稱頁數及筆數搜尋，
def query_post_list_by_title(search_string,page_size,page_number,option):
    search_list = re.split(r'[ ]', search_string)                                   # 用空白切割字串
    regex_list = [{'title':{'$regex':'|'.join(search_list), '$options':'i'}}]       # 標題搜尋
    for token in search_list:                                                      # 關鍵字,tag搜尋
        regex_list.append({'keyword':{'$regex':token, '$options':'i'}})
        regex_list.append({'tag.tag_name':{'$regex':token, '$options':'i'}})
    post_count = len([ i for i in _db.INNER_POST_COLLECTION.aggregate([{'$match': {'$or': regex_list}}])])
    if option == '': # 預設是用時間排 
        post_list = [ doc for doc in _db.INNER_POST_COLLECTION.aggregate([{'$match': {'$or': regex_list}},
                                                                          {'$project': {'_id': 1, 'title': 1, 'tag': 1, 'time': 1, 'asker_name': 1, 'incognito':1, 'score': {'$sum': '$score.score'}}}, 
                                                                          {'$sort': {'time': -1}}, 
                                                                          {'$skip': page_size * (page_number - 1)}, 
                                                                          {'$limit': page_size}])]
    else : 
        post_list = [ doc for doc in _db.INNER_POST_COLLECTION.aggregate([{'$match': {'$or': regex_list}},
                                                                          {'$project': {'_id': 1, 'title': 1, 'tag': 1, 'time': 1, 'asker_name': 1, 'incognito':1, 'score': {'$sum': '$score.score'}}}, 
                                                                          {'$sort': {option : -1}}, 
                                                                          {'$skip': page_size * (page_number - 1)}, 
                                                                          {'$limit': page_size}])]
    return {'post_count' : post_count,'post_list' : post_list}
# 依貼文標籤篩選
def query_post_list_by_tag(tag_list,page_size,page_number,option):
    post_count = len([i for i in _db.INNER_POST_COLLECTION.aggregate([{'$project': {'hastag': {'$setIsSubset': [tag_list, '$tag']}}}, 
                                                                       {'$match': {'hastag': True}}])])
    if option == '': 
        post_list = [ doc for doc in _db.INNER_POST_COLLECTION.aggregate([{'$project': {'_id': 1, 'title': 1, 'time': 1,  'asker_name': 1, 'incognito':1,'tag': 1,'asker_id': 1,'icognito': 1, 'score': {'$sum': '$score.score'}, 'hastag': {'$setIsSubset': [tag_list, '$tag']}}}, 
                                                               {'$match': {'hastag': True}},
                                                               {'$sort': {'time': -1}}, 
                                                               {'$skip': page_size * (page_number - 1)}, 
                                                               {'$limit': page_size}])]
    else : # 預設是用時間排
        post_list = [ doc for doc in _db.INNER_POST_COLLECTION.aggregate([{'$project': {'_id': 1, 'title': 1, 'time': 1,  'asker_name': 1, 'incognito':1,'tag': 1,'asker_id': 1,'icognito': 1, 'score': {'$sum': '$score.score'}, 'hastag': {'$setIsSubset': [tag_list, '$tag']}}}, 
                                                               {'$match': {'hastag': True}},
                                                               {'$sort': {option: -1}}, 
                                                               {'$skip': page_size * (page_number - 1)}, 
                                                               {'$limit': page_size}])]
    return {'post_count' : post_count,'post_list' : post_list}
# 依post_id取得特定貼文
def query_post(post_id):
    _db.INNER_POST_COLLECTION.update_one({'_id':post_id},{'$inc':{'view_count':1}})
    return _db.INNER_POST_COLLECTION.find_one({'_id':post_id})


# 依post_id,response_id取得特定回覆
def query_response(post_id,response_id):
    post = _db.INNER_POST_COLLECTION.find_one({'_id':post_id})
    return next(response for response in post['answer'] if response['_id'] == response_id)

# 新增一筆貼文
def insert_post(post_dict):
    all_post = _db.INNER_POST_COLLECTION.find()
    if all_post.count() == 0 : 
        # 處理第一篇貼文編號
        post_dict['_id'] = '000001'
    else:
        # sort post_id,將最大的+1當作新的post_id
        biggest_post_id = int(all_post.limit(1).sort('_id',-1)[0]['_id'])
        post_dict['_id'] = str(biggest_post_id + 1).zfill(6)
        
    # 將貼文新增至資料庫
    _db.INNER_POST_COLLECTION.insert_one(post_dict)
    # 更新使用者發文紀錄
    user.update_post_list(post_dict['asker_id'])
    # 更新每個tag 的 usage_counter,recent_use
    for tag in post_dict['tag']:
        _db.TAG_COLLECTION.update_one({'_id':tag['tag_id']},{'$set':{'recent_use':post_dict['time']},
                                                             '$inc':{'usage_counter':1}})
        # 使用者相關標籤積分 + 2
        user.update_user_score(post_dict['asker_id'],tag['tag_id'],tag['tag_name'],2)

# 編輯一筆貼文內容
def update_post(post_data): 
    _db.INNER_POST_COLLECTION.update_one({'_id': post_data['_id']},{'$set':
                                                                    {
                                                                        'title':post_data['title'],
                                                                        'question':post_data['question'],
                                                                        'edit':post_data['edit'],
                                                                        'keyword':post_data['keyword'],
                                                                        'time':post_data['time']}})
    # 使用者發文更新
    user.update_post_list(post_data['asker_id'])
    
    # 使用者回覆紀錄更新
    post = _db.INNER_POST_COLLECTION.find_one({'_id':post_data['_id']})
    for response in post['answer']:
        user.update_response_list(response['replier_id'])
        

# 新增貼文回覆
def insert_response(response_dict):
    target_post = _db.INNER_POST_COLLECTION.find_one({'_id':response_dict['post_id']})
    if len(target_post['answer']) == 0 : 
        # 處理第一篇回覆編號
        response_dict['_id'] = '000001'
    else:
        # sort response_id,將最大的+1當作新的response_id
        biggest_response_id = int(sorted(target_post['answer'], key = lambda k: k['_id'],reverse=True)[0]['_id'])
        response_dict['_id'] = str(biggest_response_id + 1).zfill(6)
    # 新增到answer
    response_dict.pop('post_id')
    _db.INNER_POST_COLLECTION.update_one({'_id':target_post['_id']},{'$push':{'answer':response_dict}})
    # 更新使用者回覆紀錄
    user.update_response_list(response_dict['replier_id'])
    # 更新每個tag 的 usage_counter,recent_use
    for tag in target_post['tag']:
        _db.TAG_COLLECTION.update_one({'_id':tag['tag_id']},{'$set':{'recent_use':response_dict['time']},
                                                             '$inc':{'usage_counter':1}})
        # 使用者相關標籤積分 + 1
        user.update_user_score(response_dict['replier_id'],tag['tag_id'],tag['tag_name'], 1)
    

# 編輯貼文回覆
def update_response(response_dict):
    post_id = response_dict.pop('post_id')
    _db.INNER_POST_COLLECTION.update_one({'_id':post_id,'answer._id':response_dict['_id']},
                                         {'$set':{'answer.$.response':response_dict['response'],
                                                  'answer.$.edit':response_dict['edit'],
                                                  'answer.$.time':response_dict['time']
                                                  }})
# 刪除貼文回覆
def remove_response(response_dict):
    target_post = _db.INNER_POST_COLLECTION.find_one({'_id':response_dict['post_id']})
    target_response = next(response for response in target_post['answer'] if response['_id'] == response_dict['_id'])
    tags = target_post['tag']
    _db.INNER_POST_COLLECTION.update_one({'_id':response_dict['post_id']},
                                         {'$pull':{'answer':{'_id':response_dict['_id']}}})
    user.update_response_list(response_dict['replier_id'])
    # 扣掉回覆者所得分數
    for tag in tags:
        user.update_user_score(response_dict['replier_id'],tag['tag_id'],tag['tag_name'],-(1 + sum(score['score'] for score in target_response['score'])))
        # 扣掉tag count
        _db.TAG_COLLECTION.update_one({'_id':tag['tag_id']},{'$inc':{'usage_counter': -1}})

# 編輯貼文評分
def update_score(score_dict):
    target_post = _db.INNER_POST_COLLECTION.find_one({'_id':score_dict['post_id']})
    new_score_record = {
                'user_id': score_dict['user'],
                'score' : score_dict['score']
    }
    # response_id為空表示更新貼文評分
    if len(score_dict['response_id']) == 0 :
        # 若使用者按過讚/倒讚，使用set
        if any(s['user_id'] == score_dict['user'] for s in target_post['score']):
            original_score_record = next(s for s in target_post['score'] if s['user_id'] == score_dict['user'])
            if original_score_record['score'] == score_dict['score']:
                _db.INNER_POST_COLLECTION.update_one({'_id':score_dict['post_id'],'score.user_id': score_dict['user']},{'$pull':{'score':original_score_record}})
                for tag in target_post['tag']:
                    user.update_user_score(target_post['asker_id'],tag['tag_id'],tag['tag_name'],-original_score_record['score'])
            else:
                _db.INNER_POST_COLLECTION.update_one({'_id':score_dict['post_id'],'score.user_id': score_dict['user']},{'$set':{'score.$':new_score_record}})
                # 更新被按的人的技能分數
                for tag in target_post['tag']:
                    user.update_user_score(target_post['asker_id'],tag['tag_id'],tag['tag_name'],new_score_record['score'] - original_score_record['score'])
        else:
            # 貼文本身push一個使用者評分
            _db.INNER_POST_COLLECTION.update_one({'_id':score_dict['post_id']},{'$push':{'score':new_score_record}})
            # 更新被讚的人的技能分數
            for tag in target_post['tag']:
                user.update_user_score(target_post['asker_id'],tag['tag_id'],tag['tag_name'],new_score_record['score'])
        # 更新使用者發文紀錄
        user.update_post_list(target_post['asker_id'])
        # 更新使用者回覆紀錄
        for response in target_post['answer']:
            user.update_response_list(response['replier_id'])
    
    # response_id不為空表示更新回覆評分
    else :
        target_response = query_response(score_dict['post_id'],score_dict['response_id'])
        # 若使用者按過讚/倒讚，使用set
        if any(s['user_id'] == score_dict['user'] for s in target_response['score']):
            original_score_record = next(s for s in target_response['score'] if s['user_id'] == score_dict['user'])
            if original_score_record['score'] == score_dict['score']:
                _db.INNER_POST_COLLECTION.update_one({'_id':score_dict['post_id'],'answer._id':score_dict['response_id']},{'$pull':{'answer.$.score':original_score_record}})
                for tag in target_post['tag']:
                    user.update_user_score(target_response['replier_id'],tag['tag_id'],tag['tag_name'],-original_score_record['score'])
            else:
                _db.INNER_POST_COLLECTION.update_one({'_id':score_dict['post_id'],
                                                      'answer._id':score_dict['response_id']},
                                                     {'$set':{'answer.$.score.$[elem]':new_score_record}},
                                                     array_filters= [{ "elem.user_id": score_dict['user']}])
                for tag in target_post['tag']:
                    user.update_user_score(target_response['replier_id'],tag['tag_id'],tag['tag_name'],new_score_record['score'] - original_score_record['score'])
        else:
            _db.INNER_POST_COLLECTION.update_one({'_id':score_dict['post_id'],'answer._id':score_dict['response_id']},{'$push':{'answer.$.score':new_score_record}})
            for tag in target_post['tag']:
                user.update_user_score(target_response['replier_id'],tag['tag_id'],tag['tag_name'],new_score_record['score'])
# 刪除貼文
def remove_post(post_id):
    post_dict = _db.INNER_POST_COLLECTION.find_one({'_id':post_id})
    response_list = post_dict['answer']
    # 依標籤扣除使用者分數
    tag_usage = len(post_dict['answer']) + 1
    for tag in post_dict['tag']:
        # 扣除發文時的分數
        user.update_user_score(post_dict['asker_id'],tag['tag_id'],tag['tag_name'],-(2 + sum(score['score'] for score in post_dict['score'])))
        # 扣除每則回應的分數
        for response in post_dict['answer']:
            user.update_user_score(response['replier_id'],tag['tag_id'],tag['tag_name'],-(1 + sum(score['score'] for score in response['score'])))
        # 扣除tag usage_count(發文(1)+回應數)
        _db.TAG_COLLECTION.update_one({'_id':tag['tag_id']},{'$inc':{'usage_counter': -tag_usage}})
    # 從collection移除post
    _db.INNER_POST_COLLECTION.delete_one({'_id':post_id})
    # 更新使用者發文紀錄
    user.update_post_list(post_dict['asker_id'])
    # 更新使用者回覆紀錄
    for response in response_list:
        user.update_response_list(response['replier_id'])
    
  
'''湘的'''
#內部搜尋
def query_inner_search(keywords):
    #case insensitive處理
    tag=[]
    keyword=[]
    lower_keywords=[]
    for i in keywords:
        lower_keywords.append(i.lower())
        keyword.append({'keyword':{'$regex':i, '$options':'i'}})
        tag.append({'tag.tag_name':{'$regex':i, '$options':'i'}})
    tag.extend(keyword)
    #print(lower_keywords)
    #第一階篩選數(相關貼文)，對資料做前處理（算好問題積分、最高答案積分）
    top_ten_post_dict_array = [{'_id':i['_id'], 'maxTotalAnsScore':i['maxTotalAnsScore'], 'keyword':i['keyword'], 'tag':i['tag'], 'scoreTotal':i['scoreTotal'], 'view_count':i['view_count']} for i in _db.INNER_POST_COLLECTION.aggregate(
    [
    {
        '$match': {
            '$or': tag
        }
    }, {
        '$project': {
            'keyword': 1,
            'tag': 1,
            'score': 1,
            'answer': 1,
            'view_count': 1
        }
    }, {
        '$project': {
            'scoreTotal': {
                '$sum': '$score.score'
            },
            'matches': 1,
            'answer': 1,
            'view_count': 1,
            'keyword': 1,
            'tag': 1
        }
    }, {
        '$unwind': {
            'path': '$answer',
            'preserveNullAndEmptyArrays': True
        }
    }, {
        '$unwind': {
            'path': '$answer.score',
            'preserveNullAndEmptyArrays': True
        }
    }, {
        '$group': {
            '_id': {
                '_id': '$_id',
                'ans': '$answer._id'
            },
            'totalAnsScore': {
                '$sum': '$answer.score.score'
            },
            'view_count': {
                '$first': '$view_count'
            },
            'keyword': {
                '$first': '$keyword'
            },
            'tag': {
                '$first': '$tag'
            },
            'scoreTotal': {
                '$first': '$scoreTotal'
            }
        }
    }, {
        '$group': {
            '_id': '$_id._id',
            'maxTotalAnsScore': {
                '$max': '$totalAnsScore'
            },
            'view_count': {
                '$first': '$view_count'
            },
            'keyword': {
                '$first': '$keyword'
            },
            'tag': {
                '$first': '$tag'
            },
            'scoreTotal': {
                '$first': '$scoreTotal'
            }
        }
    }
]
    )]
#    print("篩選結果：")
#    print(top_ten_post_dict_array)
    if len(top_ten_post_dict_array) > 0:
        #計算keyword match數、tag match數
        for i in top_ten_post_dict_array:
            count_key = 0
            i['matches_keyword'] = 0
            count_tag = 0
            i['matches_tag'] = 0
            i['duplicate'] = 0
            for j in i['keyword']:
                if j.lower() in lower_keywords:
                    count_key += 1
            i['matches_keyword'] = count_key
            print(i)
            for j in i['tag']:
                if j['tag_name'].lower() in lower_keywords:
                    count_tag += 1
                    for k in i['keyword']:
                        if j['tag_name'].lower() == k.lower():
                            i['duplicate']+=1
#            print(i['_id']+"duplcate:")
#            print(i['duplicate'])
            i['matches_tag'] = count_tag
            #加總match數
            i['matches'] = i['matches_keyword'] + i['matches_tag']
        
#        #計算tag match數
#        for i in top_ten_post_dict_array:
#            count_tag = 0
#            i['matches_tag'] = 0
#            for j in i['tag']:
#                if j['tag_name'].lower() in lower_keywords:
#                    count_tag += 1
#            i['matches_tag'] = count_tag
            
#        #加總match數
#        for i in top_ten_post_dict_array:
#            i['matches'] = i['matches_keyword'] + i['matches_tag']
            
        #規定至少匹配兩個
        for i in range(len(top_ten_post_dict_array)-1, -1, -1):
            if top_ten_post_dict_array[i]['matches'] - top_ten_post_dict_array[i]['duplicate'] < len(keyword)*(2/3):
                top_ten_post_dict_array.pop(i)
        
        if len(top_ten_post_dict_array) > 0:
            top_ten_post_dict_array = sorted(top_ten_post_dict_array, key=lambda k: (k['matches'], k['scoreTotal'], k['_id']), reverse=True)[0:10]
            
            #print(top_ten_post_dict_array)
            a=[]
            b=[]
            c=[]
            d=[]
            for i in top_ten_post_dict_array:
                a.append(i['matches'])
                b.append(i['scoreTotal'])
                c.append(i['view_count'])
                d.append(i['maxTotalAnsScore'])
            normalized_matches = preprocessing.normalize([a])[0]
            normalized_scoreTotal = preprocessing.normalize([b])[0]
            normalized_view_count = preprocessing.normalize([c])[0]
            normalized_maxTotalAnsScore = preprocessing.normalize([d])[0]
            
            for index, i in enumerate(top_ten_post_dict_array):
                i['normalized_matches'] = normalized_matches[index]
                i['normalized_scoreTotal'] = normalized_scoreTotal[index]
                i['normaliznormalized_view_counted_scoreTotal'] = normalized_view_count[index]
                i['normalized_maxTotalAnsScore'] = normalized_maxTotalAnsScore[index]
            
            """法一"""
        #    #根據matches, scoreTotal排名
        #    sorted_top_ten_post_dict_array = sorted(top_ten_post_dict_array, key=lambda k: (k['matches'], k['scoreTotal'], k['_id']), reverse=True)
        #    for count, i in enumerate(sorted_top_ten_post_dict_array):
        #        i['matches_scoreTotal_order'] = count
        #
        #    #根據view_count, maxTotalAnsScore排名
        #    sorted_top_ten_post_dict_array = sorted(sorted_top_ten_post_dict_array, key=lambda k: (k['view_count'], k['maxTotalAnsScore'], k['_id']), reverse=True)
        #    for count, i in enumerate(sorted_top_ten_post_dict_array):
        #        i['view_count_maxTotalAnsScore_order'] = count
        #
        #    #加權
        #    for i in sorted_top_ten_post_dict_array:
        #        i['output_order'] = i['matches_scoreTotal_order'] * 0.5 + i['view_count_maxTotalAnsScore_order'] * 0.2
        #    sorted_top_ten_post_dict_array = sorted(sorted_top_ten_post_dict_array, key=lambda k: (k['output_order'], k['_id']))
            """   """
            
            """法二"""
            #加權(5, 3, 2, 1)
            for i in top_ten_post_dict_array:
                i['output_order'] = i['normalized_matches'] * 5 + i['normalized_scoreTotal'] * 3 + i['normaliznormalized_view_counted_scoreTotal'] * 2 + i['normalized_maxTotalAnsScore']
            sorted_top_ten_post_dict_array = sorted(top_ten_post_dict_array, key=lambda k: (k['output_order'], k['_id']), reverse=True)
            """  """
            
            #print(sorted_top_ten_post_dict_array)
            ''' --- tag usage_count --- '''
            top_ten_id = [i['_id'] for i in sorted_top_ten_post_dict_array]
            for i in top_ten_id:
                tag_list = _db.INNER_POST_COLLECTION.find_one({'_id':i})['tag']
                for tag in tag_list:
                    _db.TAG_COLLECTION.update_one({'_id':tag['tag_id']},{'$set':{'recent_use':datetime.now().replace(microsecond=0)},
                                                                          '$inc':{'usage_counter':0.5}})
            
            ''' ----------------------- '''
            return [i['_id'] for i in sorted_top_ten_post_dict_array]
    else:
        #print([])
        return []
        
#五日內回覆數最多排行(近日熱門貼文)
def query_hot_post():
    five_days_ago_datetime = datetime.today() - timedelta(days=5)
    print(five_days_ago_datetime)
    hot_post = [i['_id'] for i in _db.INNER_POST_COLLECTION.aggregate([
    {
        '$unwind': {
            'path': '$answer'
        }
    }, {
        '$match': {
            'answer.time': {
                '$gte': five_days_ago_datetime
            }
        }
    }, {
        '$group': {
            '_id': '$_id',
            'recentReply': {
                '$sum': 1
            }
        }
    }, {
        '$sort': {
            'recentReply': -1
        }
    }
])]
    #print(hot_post)
    return hot_post
    
#檢查是否新增 associated tag
def check_associated_tag():
    new_associated_tag=[]
    a=defaultdict(dict)
    all_tags=[(i['tag'].lower(), i['_id']) for i in _db.TAG_COLLECTION.find()]
    all_tags_name=[i[0] for i in all_tags]
    all_tags_id=[i[1] for i in all_tags]
    all_first_level=tag.query_first_level_tag_name()
    print('all_first_level:', all_first_level)
    for i in _db.INNER_POST_COLLECTION.find():
        for j in i['keyword']:
            if j not in all_tags_name:
                for k in i['tag']:
                    if k['tag_name'] not in all_first_level:
                        if k['tag_name'] in a and j in a[k['tag_name']]:
                            a[k['tag_name']][j]=a[k['tag_name']][j]+1
                        else:
                            a[k['tag_name']][j]=1
    print(a)
#    print('all_tags_name', all_tags_name)
#    print('all_tags_id', all_tags_id)
    for key in a:   #parent tag name
        for key2 in a[key]: #keyword name
            if a[key][key2] > 20:
                #find to get parent id
                index=all_tags_name.index(key.lower())
                new_associated_tag.append((key, key2, all_tags_id[index]))
    print(new_associated_tag)
    return new_associated_tag   #tuple list, parent name, keyword, parent id

'''香的'''
