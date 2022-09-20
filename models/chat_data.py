''' ======== CHAT_DATA_COLLECTION ======== *
- 新增資料 : insert_資料名稱
- 取得資料 : query_資料名稱
- 編輯資料 : update_資料名稱
- 刪除資料 : remove_資料名稱
- 資料名稱統一，以底線分隔，function前加上註解
- 使用collection : _db.CHAT_DATA_COLLECTION
* ========================================'''
# ====== our models ===== #
from . import _db
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
    chat = _db.CHAT_DATA_COLLECTION.find_one({'_id':chat_id})
    psa_chat = _db.CHAT_DATA_COLLECTION.find_one({'psabot_room_id':chat_id})
    if chat != None:
        return chat
    elif psa_chat != None:
        return psa_chat
    else:
        return None

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
def remove_chat(id_dict):
    if len(id_dict['_id']) != 0 and len(id_dict['user_id']) == 0:
        _db.CHAT_DATA_COLLECTION.delete_one({'_id':id_dict['_id']})
    if len(id_dict['user_id']) != 0 and len(id_dict['_id']) == 0:
        # psabot 聊天室刪除只會清除聊天紀錄
        _db.CHAT_DATA_COLLECTION.update_one({'psabot_room_id':id_dict['user_id']},{'$set':{'chat_logs':[]}})
    
# 改變聊天室狀態
def change_state(chat_id,state):
    _db.CHAT_DATA_COLLECTION.update_one({'_id':chat_id},{'$set':{'enabled':state}})
    
# 取得使用者所在聊天室id,名稱
def query_room_list(user_id):
    return [ room for room in _db.CHAT_DATA_COLLECTION.aggregate([{'$match': {'members.user_id': user_id}}, 
                                               {'$project': {'_id': 1, 'question': 1,'enabled':1}}])]

# 建立機器人聊天室紀錄
def insert_psabot_chat(chat_dict):
    if _db.CHAT_DATA_COLLECTION.find_one({'psabot_room_id':chat_dict['psabot_room_id']}) == None:
        insert_chat(chat_dict)
        

# 新增機器人聊天室訊息
def insert_psabot_message(chat_dict):
    if not chat_dict['is_bot']:
        _db.CHAT_DATA_COLLECTION.update_one({'psabot_room_id':chat_dict['user_id']},
                                             {'$push':
                                              {'chat_logs':
                                               {'user_id':chat_dict['user_id'],'time':chat_dict['time'],'type':chat_dict['type'],'content':chat_dict['content']}}})
    else :
        _db.CHAT_DATA_COLLECTION.update_one({'psabot_room_id':chat_dict['user_id']},
                                             {'$push':
                                              {'chat_logs':
                                               {'user_id':'PSAbot','time':chat_dict['time'],'type':chat_dict['type'],'content':chat_dict['content']}}})