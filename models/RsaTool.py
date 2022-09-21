import rsa
import os

# key_path = "/Users/jacknahu/Documents/GitHub/PQAbot/models/"
key_path = os.path.dirname(os.path.realpath(__file__))

def rsa_setup():
    publicKey, privateKey = rsa.newkeys(512)
    # Export public key in PKCS#1 format, PEM encoded 
    with open(key_path + 'pub_key.pem','w')as file:
        file.write(publicKey.save_pkcs1().decode('utf-8'))
    with open(key_path + 'priv_key.pem','w')as file:
        file.write(privateKey.save_pkcs1().decode('utf-8'))
        

    
class RsaTool(object):

    
    def __init__(self):
        with open(key_path + '/pub_key.pem','r') as file:
            self.pubkey = rsa.PublicKey.load_pkcs1(file.read().encode('utf-8'))
        with open(key_path + '/priv_key.pem','r') as file:
            self.privkey = rsa.PrivateKey.load_pkcs1(file.read().encode('utf-8')) 

    def encrypt(self,data):
        return rsa.encrypt(data.encode('utf-8'),self.pubkey)
        
    def decrypt(self,data):
        return rsa.decrypt(data, self.privkey).decode('utf-8')


