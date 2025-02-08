import { handleQRCode } from '@/utils'
import { ElMessage } from 'element-plus'
import type { DataConnection, PeerError, PeerErrorType } from 'peerjs'
import Peer from 'peerjs'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export enum DataType {
  FILE = 'FILE',
  OTHER = 'OTHER',
}
export interface Data {
  dataType: DataType
  file?: Blob
  fileName?: string
  fileType?: string
  message?: string
}

export const usePeerStore = defineStore('peer', () => {
  const p = ref<Peer | undefined>(undefined)
  const peerId = ref<string>()
  const cmap = ref(new Map<string, DataConnection>())
  const connectionMap = cmap.value

  const startPeerSession = () =>
    new Promise(async (resolve, reject) => {
      try {
        const tmp = new Peer()
        tmp
          .on('open', (id) => {
            console.log('My ID: ' + id)
            // 貌似peer在连接时候里面属性的更新ref无法监听到，直接借助回调来手动更新peer
            p.value = tmp
            peerId.value = id
            resolve(id)
          })
          .on('error', (err) => {
            reject(err)
          })
      } catch (err) {
        console.error(err)
        reject(err)
      }
    })

  const closePeerSession = async () => {
    try {
      if (p.value) {
        p.value.destroy()
        p.value = undefined
      }
    } catch (err) {
      console.error(err)
    }
  }

  const connectPeer = (id: string) => {
    const peer = p.value
    if (!peer || connectionMap.has(id)) {
      return
    }

    try {
      const conn = peer.connect(id, { reliable: true })
      if (!conn) {
        return
      }
      conn
        .on('open', function () {
          console.log('Connect to: ' + id)
          connectionMap.set(id, conn)
          peer?.removeListener('error', handlePeerError)
        })
        .on('error', function (err) {
          peer?.removeListener('error', handlePeerError)
          throw err
        })

      const handlePeerError = (err: PeerError<`${PeerErrorType}`>) => {
        if (err.type === 'peer-unavailable') {
          const messageSplit = err.message.split(' ')
          const peerId = messageSplit[messageSplit.length - 1]
          ElMessage.error('Peer ' + peerId + ' is not available')
        }
      }
      peer.on('error', handlePeerError)
    } catch (err) {
      console.error(err)
    }
  }

  const onIncomingConnection = (callback: (conn: DataConnection) => void) => {
    p.value?.on('connection', function (conn) {
      console.log('Incoming connection: ' + conn.peer)
      connectionMap.set(conn.peer, conn)
      callback(conn)
    })
  }

  const onConnectionDisconnected = (id: string, callback: () => void) => {
    if (!p.value) {
      throw new Error("Peer doesn't start yet")
    }
    if (!connectionMap.has(id)) {
      throw new Error("Connection didn't exist")
    }
    const conn = connectionMap.get(id)
    if (conn) {
      conn.on('close', function () {
        console.log('Connection closed: ' + id)
        connectionMap.delete(id)
        callback()
      })
    }
  }
  const sendConnection = (id: string, data: Data): Promise<void> =>
    new Promise((resolve, reject) => {
      if (!connectionMap.has(id)) {
        reject(new Error("Connection didn't exist"))
      }
      try {
        const conn = connectionMap.get(id)
        if (conn) {
          conn.send(data)
        }
      } catch (err) {
        reject(err)
      }
      resolve()
    })
  const onConnectionReceiveData = (id: string, callback: (f: Data) => void) => {
    if (!p.value) {
      throw new Error("Peer doesn't start yet")
    }
    if (!connectionMap.has(id)) {
      throw new Error("Connection didn't exist")
    }
    const conn = connectionMap.get(id)
    if (conn) {
      conn.on('data', function (receivedData) {
        console.log('Receiving data from ' + id)
        const data = receivedData as Data
        callback(data)
      })
    }
  }

  const startPeer = async () => {
    try {
      await closePeerSession()
      const myId = await startPeerSession()
      onIncomingConnection((conn) => {
        const peerId = conn.peer
        // dispatch(addConnectionList(peerId))
        onConnectionDisconnected(peerId, () => {
          ElMessage.info('Connection closed: ' + peerId)
          // dispatch(removeConnectionList(peerId))
        })
        onConnectionReceiveData(peerId, (file) => {
          ElMessage.info('Receiving file ' + file.fileName + ' from ' + peerId)
          if (file.dataType === DataType.FILE) {
            // download(file.file || '', file.fileName || "fileName", file.fileType)
          }
        })
      })
    } catch (err) {
      ElMessage.error('Failed to initialize peer connection')
    }
  }

  return {
    peer: p,
    peerId,
    connectionMap,
    closePeerSession,
    connectPeer,
    sendConnection,
    startPeer,
  }
})
