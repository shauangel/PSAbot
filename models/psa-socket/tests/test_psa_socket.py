import json
import unittest
from main import socketio,app

def connect_client(user_id):
    client = socketio.test_client(app, query_string='?user_id=' + user_id)
    return client

def get_file_input(data_folder,function_name):
    with open('data/' + data_folder + '/' + function_name + '_input.json', 'r', encoding = 'utf-8') as file:
            text_input = json.load(file)
    return text_input

def get_file_output(data_folder,function_name):
    with open('data/' + data_folder + '/' + function_name + '_output.json', 'r', encoding = 'utf-8') as file:
            text_input = json.load(file)
    return text_input

class TestSocketIO(unittest.TestCase):
    def test_connect(self):
        client = socketio.test_client(app, query_string='?user_id=test_user')
        # client.get_received()[0]['args'] == 'test_user has connected.'
        self.assertEqual(client.get_received()[0]['args'][0],'test_user has connected.')
        
        
    def test_create_room(self):
        client = connect_client('116287698501129823679')
        received = client.get_received()
        json_input = get_file_input('realtime-discussion-module', 'create_room')
        json_output = get_file_output('realtime-discussion-module', 'create_room')
        client.emit('create_room', json_input)
        received = client.get_received()
        self.assertEqual(received[0]['name'], 'received_message')
        self.assertEqual(received[0]['args'][0],json_output)
        
    def test_join_room(self):
        client = connect_client('4168365173258689')
        received = client.get_received()
        json_input = get_file_input('realtime-discussion-module', 'join_room')
        client.emit('join_room', json_input)
        received = client.get_received()
        self.assertEqual(received[0]['name'], 'received_message')
        
    def test_send_message(self):
        client = connect_client('116287698501129823679')
        received = client.get_received()
        json_input = get_file_input('realtime-discussion-module', 'send_message')
        json_output = get_file_output('realtime-discussion-module', 'send_message')
        client.emit('send_message', json_input)
        received = client.get_received()
        self.assertEqual(received[0]['name'], 'received_message')
        self.assertEqual(received[0]['args'][0],json_output)