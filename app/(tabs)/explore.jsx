import React, { useEffect, useState } from 'react';
import { Button, StyleSheet, Text, TextInput, View } from 'react-native';
// import { Client } from 'react-native-mqtt';
import * as mqtt from 'mqtt/dist/mqtt';
const MQTTComponent = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [client, setClient] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  // Configuración del broker HiveMQ
  const brokerConfig = {
    host: 'wss://2807ccce5f924766a34afeab1eb54217.s2.eu.hivemq.cloud:8884/mqtt',
    port: 8884,
    clientId: 'rn-client-' + Math.random().toString(16).substr(2, 8),
    username: 'cristian', // Reemplaza con tu usuario
    password: 'R3gh45#yER', // Reemplaza con tu contraseña
    protocol: 'wss', // WebSocket Secure
    tls: true,
  };

  // Conexión MQTT

  

    useEffect(() => {
      const client = mqtt.connect('wss://2807ccce5f924766a34afeab1eb54217.s2.eu.hivemq.cloud:8884/mqtt', {
        username: 'cristian',
        password: 'R3gh45#yER',
        clientId: 'web-client-' + Math.random().toString(16).substr(2, 8),
      });
  
      client.on('connect', () => {
        client.subscribe('gbic/RESPONSE/#');
      });
  
      return () => client.end();
    }, []);
  

  return (
    <View style={styles.container}>
      <Text style={styles.status}>
        Estado: {isConnected ? 'Conectado' : 'Desconectado'}
      </Text>

      <Button
        title={isConnected ? 'Desconectar' : 'Conectar'}
        onPress={isConnected ? disconnectMQTT : connectMQTT}
        color={isConnected ? '#FF3B30' : '#34C759'}
      />

      <TextInput
        style={styles.input}
        value={inputMessage}
        onChangeText={setInputMessage}
        placeholder="Escribe un mensaje"
      />

      <Button
        title="Publicar"
        onPress={publishMessage}
        disabled={!isConnected}
      />

      <View style={styles.messages}>
        {messages.map((msg, index) => (
          <Text key={index} style={styles.message}>
            {msg}
          </Text>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  status: {
    fontSize: 18,
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginVertical: 10,
    backgroundColor: '#fff',
  },
  messages: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
  },
  message: {
    padding: 8,
    backgroundColor: '#e1f5fe',
    marginBottom: 5,
    borderRadius: 5,
  },
});

export default MQTTComponent;