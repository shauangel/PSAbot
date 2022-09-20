''' ======== CHAT_DATA_COLLECTION ======== *
- 新增資料 : insert_資料名稱
- 取得資料 : query_資料名稱
- 編輯資料 : update_資料名稱
- 刪除資料 : remove_資料名稱
- 資料名稱統一，以底線分隔，function前加上註解
- 使用collection : _db.CHAT_DATA_COLLECTION
* ========================================'''
# ====== our models ===== #
import _db
# ======================= #


# 建立聊天紀錄
def insert_chat(chat_dict):
    all_chat = _db.CHAT_DATA_COLLECTION.find()
    if all_chat.count() == 0 : 
        # 處理第一則記錄編號
        chat_dict['_id'] = '000001'
    else:
        # sort ,將最大的+1當作新的chat_id
        biggest_chat_id = int(all_chat.limit(1).sort('_id',-1)[0]['_id'])
        chat_dict['_id'] = str(biggest_chat_id + 1).zfill(6)
        
    if len(chat_dict['tags']) != 0:
        for tag in chat_dict['tags']:
            _db.TAG_COLLECTION.update_one({'_id':tag['tag_id']},{'$set':{'recent_use':chat_dict['time']},
                                                                         '$inc':{'usage_counter':1}})
    _db.CHAT_DATA_COLLECTION.insert_one(chat_dict)
    return chat_dict['_id']

# 將使用者加入聊天室
def insert_member(chat_dict):
     _db.CHAT_DATA_COLLECTION.update_one({'_id':chat_dict['_id']},
                                         {'$push':
                                          {'members':
                                           {'user_id':chat_dict['user_id'],'incognito':chat_dict['incognito']}}})

# 取得聊天紀錄
def query_chat(chat_id):
    return _db.CHAT_DATA_COLLECTION.find_one({'_id':chat_id})

# 新增一則訊息到紀錄
def insert_message(chat_dict):
    _db.CHAT_DATA_COLLECTION.update_one({'_id':chat_dict['_id']},
                                         {'$push':
                                          {'chat_logs':
                                           {'user_id':chat_dict['user_id'],'time':chat_dict['time'],'type':chat_dict['type'],'content':chat_dict['content']}}})
    
# 設定end_flag
def end_chat(chat_id,flag,setmode):
    if setmode == 1:
        _db.CHAT_DATA_COLLECTION.update_one({'_id':chat_id},{'$set':{'end_flag':flag}})
        return flag
    elif setmode == 0:
        return _db.CHAT_DATA_COLLECTION.find_one({'_id':chat_id})['end_flag'] == flag

# 刪除聊天室
def remove_chat(chat_id):
    chat_dict = _db.CHAT_DATA_COLLECTION.find_one({'_id':chat_id})
    if len(chat_dict['tags']) != 0:
        for tag in chat_dict['tags']:
            _db.TAG_COLLECTION.update_one({'_id':tag['tag_id']},{'$set':{'recent_use':chat_dict['time']},
                                                                         '$inc':{'usage_counter':-1}})
    _db.CHAT_DATA_COLLECTION.delete_one({'_id':chat_id})
    
# 改變聊天室狀態
def change_state(chat_id,state):
    _db.CHAT_DATA_COLLECTION.update_one({'_id':chat_id},{'$set':{'enabled':state}})
    
# 取得使用者所在聊天室id,名稱
def query_room_list(user_id):
    return [ room for room in _db.CHAT_DATA_COLLECTION.aggregate([{'$match': {'members.user_id': user_id}}, 
                                               {'$project': {'_id': 1, 'question': 1,'enabled':1}}])]