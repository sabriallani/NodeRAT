import cv2, time, sys, pickle, struct, socket, os, hashlib, datetime

class Video:

    def getVideo(self, port = 1529):
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        print('Socket created')
        sock.bind(("", port))
        print('Socket bind complete')
        sock.listen(10)
        print('Socket now listening')
        conn, addr = sock.accept()
        data = b''
        payload_size = struct.calcsize("L") 
        while True: 
            while len(data) < payload_size:
                data += conn.recv(4096)
            packed_msg_size = data[:payload_size]
            data = data[payload_size:]
            msg_size = struct.unpack("L", packed_msg_size)[0]
            while len(data) < msg_size:
                data += conn.recv(4096)
            frame_data = data[:msg_size]
            data = data[msg_size:]
            frame = pickle.loads(frame_data)
            print(frame)
            if cv2.waitKey(1) == 27:
                sock.close()
                print("window close called")
                break
            cv2.imshow('frame',frame)
            

    def getPicture(self, port= 1530):
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        print('Socket created')

        sock.bind(("", port))
        print('Socket bind complete')
        sock.listen(10)
        print('Socket now listening')

        conn, addr = sock.accept()


        data = b''
        payload_size = struct.calcsize("L")
        name = hashlib.md5()
        name.update(str(datetime.datetime.now()).encode("utf-8"))
        name = str(name.hexdigest()) + ".jpg"                
        while True:
            while len(data) < payload_size:
                data += conn.recv(4096)
            packed_msg_size = data[:payload_size]
            print("1")
            data = data[payload_size:]
            msg_size = struct.unpack("L", packed_msg_size)[0]
            while len(data) < msg_size:
                data += conn.recv(4096)
            frame_data = data[:msg_size]
            data = data[msg_size:]
            frame = pickle.loads(frame_data)
            cv2.imwrite(name, frame)
            break



if __name__ == '__main__':
    v = Video()
    getattr(v, sys.argv[1]).__call__()
    # v.getPciture() # don't run both on same time you'll get window freeze
