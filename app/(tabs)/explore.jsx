import AsyncStorage from '@react-native-async-storage/async-storage';
import parseMilliseconds from 'parse-ms';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Button,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

import MapView, { Marker } from 'react-native-maps';
import mqtt from 'react-native-mqtt';
import { RadioButton } from 'react-native-paper';

// let MapView, Marker;
// if (Platform.OS !== 'web') {
//   try {
//     const maps = require('react-native-maps');
//     MapView = maps.MapView;
//     Marker = maps.Marker;
//   } catch (e) {
//     console.warn('react-native-maps no está instalado');
//   }
// } else {
//   // Implementación dummy para web
//   MapView = ({ children, style }) => <View style={style}>{children}</View>;
//   Marker = ({ children }) => <>{children}</>;
// }

// // Solución para MQTT
// let mqtt;
// if (Platform.OS !== 'web') {
//   try {
//     mqtt = require('react-native-mqtt');
//   } catch (e) {
//     console.warn('react-native-mqtt no está instalado');
//   }
// } else {
//   // Implementación dummy para web o usa mqtt.js para web
//   mqtt = {
//     createClient: () => ({
//       connect: () => console.log('MQTT dummy connected'),
//       on: (event, cb) => console.log(`MQTT dummy event: ${event}`),
//       subscribe: (topic) => console.log(`MQTT dummy subscribe to ${topic}`),
//       publish: (topic, message) => console.log(`MQTT dummy publish to ${topic}: ${message}`),
//       end: () => console.log('MQTT dummy disconnected')
//     })
//   };
// }

 // Renderizado condicional para mapas
 const renderMap = () => {
    if (Platform.OS === 'web') {
      return (
        <View style={styles.map}>
          <Text>Mapa no disponible en web</Text>
        </View>
      );
    }

    return (
      <MapView style={styles.map} initialRegion={{}}>
        {ubicaciones.map((ubicacion, index) => (
          <Marker
            key={index}
            coordinate={{ latitude: ubicacion.lat, longitude: ubicacion.lng }}
            title={ubicacion.nombre}
            description={`Voltaje: ${ubicacion.voltageCFE}, Temp: ${ubicacion.temperatura}`}
          />
        ))}
      </MapView>
    );
  };
// Estilos
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f5f5f5',
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  column: {
    width: '100%',
    marginBottom: 20,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  button: {
    marginTop: 10,
    borderRadius: 4,
  },
  select: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 4,
    marginBottom: 10,
    backgroundColor: 'white',
  },
  map: {
    width: '100%',
    height: 200,
    marginVertical: 10,
  },
  statusText: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  activeStatus: {
    color: 'green',
    fontWeight: 'bold',
  },
  inactiveStatus: {
    color: '#758f75',
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  radioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  radioButton: {
    marginHorizontal: 10,
  },
});

// Componente ToggleButton personalizado
const ToggleButton = ({ state, onChange }) => {
  return (
    <Switch
      value={state}
      onValueChange={onChange}
      trackColor={{ false: '#767577', true: '#81b0ff' }}
      thumbColor={state ? '#f5dd4b' : '#f4f3f4'}
    />
  );
};

const getClientId = async () => {
  try {
    let storedClientId = await AsyncStorage.getItem('mqttClientId');

    if (!storedClientId) {
      storedClientId = `Client_${Math.random().toString(36).substr(2, 9)}_${Date.now()}`;
      await AsyncStorage.setItem('mqttClientId', storedClientId);
      Alert.alert('Nuevo Client ID', storedClientId);
    }

    return storedClientId;
  } catch (e) {
    console.error('Error al obtener clientId', e);
    return `Client_${Math.random().toString(36).substr(2, 9)}_${Date.now()}`;
  }
};

const initialList = [
  {
    id: 11,
    name: 'OmarTEST01',
    espid: 'esp32-24dcc305cac8',
    complete: false,
  },
];

const initCurrentID = [
  { DeviceID: '', complete: false },
  { Server: 'sensores.gbic.mx', complete: false },
  { IP: '', complete: false },
  { Port: '8086', complete: false },
  { Time: '10000', complete: false },
  {
    Token: '9yVls0LERVkNgRmaAMio6J4SbZ7IRI7ZZyS77LXKqzjKzZj-qT3iirJ5YJK5c5d3OrD2EzthGI2WqWzzyziAEQ==',
    complete: false,
  },
  { Database: 'sensores', complete: false },
  { Ubicación: 'Morelia01', complete: false },
  { Zona: 'Centro', complete: false },
  { updatepass: 'Centro', complete: false },
  { Compilation: '0.0', complete: false },
];

function DevicesBendita() {
  const [Toggled1, setToggled1] = useState(false);
  const [Toggled2, setToggled2] = useState(false);
  const [url, setUrl] = useState('https://iotayudo.com/download/sketch2.121.bin');
  const [off, setOff] = useState(0);
  const [lat, setLat] = useState(0);
  const [lng, setLng] = useState(0);
  const [focus, setFocus] = useState([19.70078, -101.18443]);
  const [selectedOption, setSelectedOption] = useState(
    url.includes('sketch') ? 'sketch' : 'spiffs'
  );
  const [activityMap, setActivityMap] = useState({});
  const [actionMap, setActionMap] = useState({});
  const [lastDatas, setLastDatas] = useState('');
  const [currentID, setCurrentID] = useState(initCurrentID);
  const [mqttconnected, setMqttconnected] = useState(false);
  const [currentDeviceID, setCurrentDeviceID] = useState('');
  const [mqclient, setMqClient] = useState(null);
  const [encrypted, setEncrypted] = useState('');
  const [flgFromAnswordShowme, setFlgFromAnswordShowme] = useState(false);
  const [lastAct, setLastAct] = useState(null);
  const [ubicaciones, setUbicaciones] = useState([]);
  const [value, setValue] = useState('');
  const [list, setList] = useState(initialList);
  const [mesg, setMesg] = useState(<Text style={{ fontStyle: 'italic' }}>nothing heard</Text>);
  const [mesg2, setMesg2] = useState(<Text style={{ fontStyle: 'italic' }}>nothing heard</Text>);
  const [connected, setConnected] = useState(false);
  const [disabledList, setdisabledList] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  // Cargar lista al iniciar
  useEffect(() => {
    const loadList = async () => {
      try {
        const savedList = await AsyncStorage.getItem('list');
        if (savedList) {
          setList(JSON.parse(savedList));
        }
      } catch (e) {
        console.error('Error al cargar lista', e);
      }
    };
    loadList();
  }, []);

  // Conectar automáticamente después de 2 segundos
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!mqttconnected) {
        connectToMQTT();
      }
    }, 2000);
    return () => clearTimeout(timeout);
  }, []);

  // Seleccionar dispositivo aleatorio después de conectar
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (mqttconnected && list.length > 0) {
        const randomEspid = list[0].espid;
        setSelectedDevice(randomEspid);
        handleChangeList(randomEspid);
      }
    }, 2000);
    return () => clearTimeout(timeout);
  }, [mqttconnected]);

  // Actualizar ubicaciones cuando cambia la lista
  useEffect(() => {
    if (flgFromAnswordShowme) {
      setFlgFromAnswordShowme(false);
      handlegetlastdatas();
    }

    const ubicacionesConCoords = list
      .filter((item) => item.lat && item.lng)
      .map((item) => ({
        lat: item.lat,
        lng: item.lng,
        nombre: item.name,
        voltageCFE: item.voltageCFE || '-',
        temperatura: item.temperatura || '-',
      }));

    setUbicaciones(ubicacionesConCoords);
  }, [list]);

  const encryptPassword = (input) => {
    let encrypted = '';
    for (let i = 0; i < input.length; i++) {
      let encoded = (input.charCodeAt(i) ^ 0x5a) + 3;
      if (!/[a-zA-Z0-9]/.test(String.fromCharCode(encoded))) {
        encoded = 65 + (encoded % 26);
      }
      encrypted += String.fromCharCode(encoded);
    }
    return encrypted;
  };

  const handleupdatedatas = () => {
    if (mqclient && currentDeviceID) {
      mqclient.publish(`gbic/REQUEST/${currentDeviceID}`, '{updatedatas}', (error) => {
        if (error) {
          console.error('Error publicando en MQTT:', error);
          Alert.alert('Error', 'Error al enviar comando updatedatas');
        } else {
          console.log('Publicado:"{updatedatas}"');
        }
      });
    } else {
      Alert.alert('Error', 'MQTT client o dispositivo no disponible');
    }
  };

  const handlegetstatusupload = () => {
    if (mqclient && currentDeviceID) {
      mqclient.publish(`gbic/REQUEST/${currentDeviceID}`, '{statusupload}', (error) => {
        if (error) {
          console.error('Error publicando en MQTT:', error);
          Alert.alert('Error', 'Error al enviar comando statusupload');
        } else {
          console.log('Publicado:"{statusupload}"');
        }
      });
    } else {
      Alert.alert('Error', 'MQTT client o dispositivo no disponible');
    }
  };

  const handlegetlastdatas = () => {
    if (mqclient && currentDeviceID) {
      mqclient.publish(`gbic/REQUEST/${currentDeviceID}`, '{getLastDatas}', (error) => {
        if (error) {
          console.error('Error publicando en MQTT:', error);
          Alert.alert('Error', 'Error al enviar comando getLastDatas');
        } else {
          console.log('Publicado:"{getLastDatas}"');
        }
      });
    } else {
      Alert.alert('Error', 'MQTT client o dispositivo no disponible');
    }
  };

  const handleToggle = (idx, currentState, setState) => {
    const newState = !currentState;
    setState(newState);

    const jsonData = {
      peripheric: idx,
      state: newState,
    };
    const jsonString = JSON.stringify(jsonData);

    if (mqclient && currentDeviceID) {
      mqclient.publish(`gbic/REQUEST/${currentDeviceID}`, jsonString, (error) => {
        if (error) {
          console.error('Error publicando en MQTT:', error);
          Alert.alert('Error', 'Error al enviar comando toggle');
        } else {
          console.log(`Publicado: ${jsonString}`);
        }
      });
    } else {
      Alert.alert('Error', 'MQTT client o dispositivo no disponible');
    }
  };

  const handleChangeList = async (selectedValue) => {
    setMesg2(`Current DEVICEID: ${selectedValue}`);
    setCurrentDeviceID(selectedValue);

    setCurrentID({
      ...currentID,
      DeviceID: '',
      IP: '',
      Server: '',
      token: '',
      Time: '',
      Token: '',
      Database: '',
      Ubicación: selectedValue,
      Zona: '',
      updatepass: '',
      Compilation: '',
    });
    setEncrypted('');
    setLastDatas('');

    if (!mqttconnected) {
      Alert.alert('Error', 'No conectado al servidor MQTT');
      return;
    }

    mqclient.publish(
      `gbic/REQUEST/${selectedValue}`,
      JSON.stringify({ showmeyougot: 'true' }),
      1,
      (error) => {
        if (error) {
          console.log('Publish error: ', error);
          Alert.alert('Error', 'Error al enviar comando showmeyougot');
        }
      }
    );
  };

  const handleChangeDevice = (field, value) => {
    setCurrentID((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmiturl = () => {
    if (!mqclient || !currentDeviceID) {
      Alert.alert('Error', 'MQTT client o dispositivo no disponible');
      return;
    }

    const jsonData = { updateFirmFrom: url };
    const jsonString = JSON.stringify(jsonData);

    mqclient.publish(`gbic/REQUEST/${currentDeviceID}`, jsonString, (error) => {
      if (error) {
        console.error('Error publicando en MQTT:', error);
        Alert.alert('Error', 'Error al enviar URL de actualización');
      } else {
        console.log(`Publicado: ${jsonString}`);
        Alert.alert('Éxito', 'Comando de actualización enviado');
      }
    });
  };

  const handleSetOffset = () => {
    if (!mqclient || !currentDeviceID) {
      Alert.alert('Error', 'MQTT client o dispositivo no disponible');
      return;
    }

    const jsonData = { setoffset: off };
    const jsonString = JSON.stringify(jsonData);

    mqclient.publish(`gbic/REQUEST/${currentDeviceID}`, jsonString, (error) => {
      if (error) {
        console.error('Error publicando en MQTT:', error);
        Alert.alert('Error', 'Error al enviar offset');
      } else {
        console.log(`Publicado: ${jsonString}`);
        Alert.alert('Éxito', 'Offset enviado');
      }
    });
  };

  const handleAdd = async () => {
    if (value) {
      const newItem = {
        id: list.length + 1,
        name: value,
        espid: value,
        complete: false,
      };

      const exists = list.some((item) => item.espid === newItem.espid);

      if (!exists) {
        const newList = [...list, newItem];
        setList(newList);
        try {
          await AsyncStorage.setItem('list', JSON.stringify(newList));
        } catch (e) {
          console.error('Error al guardar lista', e);
        }
      } else {
        Alert.alert('Error', `El dispositivo con espid "${newItem.espid}" ya existe en la lista.`);
      }
    }

    setValue('');
  };

  const handleSubmiteElements = (field) => {
    if (currentDeviceID === '') {
      Alert.alert('Error', 'Elije un device ID');
      return;
    }
    if (!mqttconnected) {
      Alert.alert('Error', 'No conectado');
      return;
    }

    const jsonData = {
      elemento: field,
      value: currentID[field],
    };

    const jsonString = JSON.stringify(jsonData);

    if (mqclient && currentID.DeviceID) {
      const topic = `gbic/REQUEST/${currentID.DeviceID}`;
      mqclient.publish(topic, jsonString, (error) => {
        if (error) {
          console.error('Error al publicar en MQTT:', error);
          Alert.alert('Error', 'Error al enviar configuración');
        } else {
          console.log(`Publicado en el tópico: ${topic}`);
          Alert.alert('Éxito', 'Configuración enviada');
        }
      });
    }
  };

  const connectToMQTT = async () => {
    if (!mqttconnected) {
      try {
        const clientId = await getClientId();
        const options = {
          clientId,
          username: 'cristian',
          password: 'R3gh45#yER',
          clean: true,
        };

        const client = mqtt.connect('wss://2807ccce5f924766a34afeab1eb54217.s2.eu.hivemq.cloud:8884/mqtt', options);

        client.on('connect', () => {
          list.forEach((device) => {
            client.subscribe(`gbic/RESPONSE/${device.espid}`, { qos: 1 }, (error) => {
              if (error) {
                console.log(`Error al suscribirse a ${device.espid}:`, error);
              } else {
                console.log(`Suscrito a ${device.espid}`);
              }
            });
          });

          setMqClient(client);
          setdisabledList(true);
          setMqttconnected(true);
        });

        client.on('message', (topic, message) => {
          setLastAct(new Date().toLocaleString());
          const espid = topic.split('/').pop();

          try {
            const data = JSON.parse(message.toString());
            setActivityMap((prev) => ({
              ...prev,
              [espid]: true,
            }));

            const isAnswordShowme =
              data.server && data.token && data.time && data.db && data.location && data.zone;

            if (isAnswordShowme) {
              setCurrentID((prev) => ({
                ...prev,
                DeviceID: espid,
                IP: data.IP || '',
                Server: data.server || '',
                token: data.token || '',
                Time: String(data.time) || '',
                port: String(data.port) || '',
                Token: data.token ? data.token.substring(0, 20) + '...' : '' || '',
                Database: data.db || '',
                Ubicación: data.location || '',
                Zona: data.zone || '',
                updatepass: data.updatepass || '',
                Compilation: data.COMPILATION,
              }));

              setEncrypted(encryptPassword(espid));

              if (data.Perifs && Array.isArray(data.Perifs)) {
                const perif3 = data.Perifs.find((perif) => perif.idx === 3);
                const perif4 = data.Perifs.find((perif) => perif.idx === 4);
                setToggled1(perif3 ? perif3.state : false);
                setToggled2(perif4 ? perif4.state : false);
              }

              if (data.getOffset !== undefined) {
                setOff(data.getOffset);
              } else {
                setOff('-');
              }

              const now = new Date();
              const time = now.toLocaleTimeString();
              const date = now.toLocaleDateString();

              setActionMap((prev) => ({
                ...prev,
                [espid]: '[' + (data.IP || '') + '] [' + formatName(`${time} ${date}`, 8) + ']',
              }));

              const updatedList = (prevList) =>
                prevList.map((item) => {
                  if (item.espid === espid) {
                    if (item.lat && item.lng) {
                      setLat(item.lat);
                      setLng(item.lng);
                      setFocus([item.lat, item.lng]);
                    } else {
                      setFocus([19.70078, -101.18443]);
                    }
                    return { ...item, name: data.location, voltageCFE: '-', temperatura: '-' };
                  }
                  return item;
                });

              setList(updatedList);
              AsyncStorage.setItem('list', JSON.stringify(updatedList));
              setFlgFromAnswordShowme(true);
            } else {
              setActionMap((prev) => {
                let status = '[Error desconocido]';

                if (data.statusupload !== undefined) {
                  status = data.statusupload === '204' ? '[Transmitiendo]' : '[Err en transmisión]';
                } else if (data.updateSketch !== undefined) {
                  status = data.updateSketch ? '[updateSketch OK]' : '[Err updateSketch]';
                } else if (data.updatedatas !== undefined) {
                  status = data.updatedatas ? '[GBIC data updated]' : '[Err updated]';
                } else if (data.updateSpiffs !== undefined) {
                  status = data.updateSpiffs ? '[updateSpiffs OK]' : '[Err updateSpiffs]';
                } else if (data.ONLINE !== undefined) {
                  status = data.ONLINE ? '[ONLINE OK]' : '[Err ONLINE]';
                } else if (data.lastDatas !== undefined) {
                  status = '[Battery ' + data.Battery.toFixed(1) + '%]';
                  status =
                    status +
                    ' [' +
                    formatName(formatDuration(data.uptime ? data.uptime : 0), 6) +
                    ']';
                  status = status + ' [' + formatName(data.lastDatas, 15) + ']';

                  setLastDatas(
                    'Encendido desde: ' +
                      formatDuration(data.uptime ? data.uptime : 0) +
                      ', con datos: ' +
                      data.lastDatas +
                      ' and batteria interna: ' +
                      data.Battery
                  );

                  const updatedList = (prevList) =>
                    prevList.map((item) => {
                      if (item.espid === espid) {
                        const datos = Object.fromEntries(
                          data.lastDatas
                            .trim()
                            .split('\n')
                            .map((line) => line.split('='))
                        );

                        const voltageCFE = parseFloat(datos.voltaje_cfe);
                        const temperatura = parseFloat(datos.temperatura);

                        return {
                          ...item,
                          voltageCFE,
                          temperatura,
                        };
                      }
                      return item;
                    });

                  setList(updatedList);
                }

                const now = new Date();
                const time = now.toLocaleTimeString();
                const date = now.toLocaleDateString();

                status = status + ' [' + formatName(`${time} ${date}`, 8) + ']';

                return {
                  ...prev,
                  [espid]: status,
                };
              });
            }

            setTimeout(() => {
              setActivityMap((prev) => ({
                ...prev,
                [espid]: false,
              }));
            }, 20000);
          } catch (e) {
            console.error('Error al procesar mensaje MQTT:', e);
          }
        });

        client.on('error', (error) => {
          console.error('Error en conexión MQTT:', error);
          Alert.alert('Error', 'Error en conexión MQTT');
        });
      } catch (e) {
        console.error('Error al conectar MQTT:', e);
        Alert.alert('Error', 'Error al conectar MQTT');
      }
    } else {
      if (mqclient) {
        mqclient.end(() => {
          setMqClient(null);
          setMqttconnected(false);
          setdisabledList(false);
          setCurrentID({
            ...currentID,
            DeviceID: '',
            IP: '',
            Server: '',
            token: '',
            Time: '',
            Token: '',
            Database: '',
            Ubicación: '',
            Zona: '',
            updatepass: '',
            Compilation: '',
          });
        });
      }
    }
  };

  const handleClearLocalStorage = async () => {
    try {
      await AsyncStorage.removeItem('list');
      setList([]);
      Alert.alert('Éxito', 'LocalStorage limpiado');
    } catch (e) {
      console.error('Error al limpiar LocalStorage', e);
      Alert.alert('Error', 'Error al limpiar LocalStorage');
    }
  };

  const formatDuration = (duration) => {
    const { days, hours, minutes, seconds } = parseMilliseconds(duration * 1000);
    let formatted = '';

    if (days) {
      formatted += pluralize(days, 'day');
    }
    if (formatted || hours) {
      formatted += pluralize(hours, 'hour');
    }
    if (formatted || minutes) {
      formatted += pluralize(minutes, 'minute');
    }
    if (formatted || seconds) {
      formatted += pluralize(seconds, 'second');
    }

    return formatted.trim();
  };

  const pluralize = (count, noun, suffix = 's') =>
    ` ${count} ${noun}${count !== 1 ? suffix : ''} `;

  const handleDownloadList = async () => {
    try {
      const jsonData = JSON.stringify(list, null, 2);
      // En React Native necesitamos una solución diferente para descargar archivos
      // Podríamos usar react-native-fs para guardar localmente
      // O compartir el archivo usando react-native-share
      Alert.alert(
        'Lista JSON',
        jsonData,
        [
          {
            text: 'OK',
            onPress: () => console.log('OK Pressed'),
          },
        ],
        { cancelable: false }
      );
    } catch (error) {
      Alert.alert('Error', 'Error al generar JSON');
    }
  };

  const formatName = (name, ct = 10) => {
    if (name.length > ct) {
      return name.substring(0, ct) + '...';
    } else {
      return name.padEnd(ct, '  ');
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Grupo Izquierdo */}
      <View style={styles.column}>
        <View style={styles.card}>
          <Text style={styles.title}>Device Connection</Text>
          <Button
            title={mqttconnected ? 'Disconnect' : 'Connect'}
            onPress={connectToMQTT}
            color={mqttconnected ? '#f44336' : '#4CAF50'}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>DEVICES</Text>
          <TouchableOpacity
            onPress={() => setModalVisible(true)}
            style={{
              borderWidth: 1,
              borderColor: '#ccc',
              padding: 10,
              borderRadius: 4,
              marginBottom: 10,
            }}
          >
            <Text>{selectedDevice || 'Seleccionar dispositivo'}</Text>
          </TouchableOpacity>

          <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}
          >
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: 'rgba(0,0,0,0.5)',
              }}
            >
              <View
                style={{
                  backgroundColor: 'white',
                  padding: 20,
                  borderRadius: 10,
                  width: '80%',
                  maxHeight: '80%',
                }}
              >
                <ScrollView>
                  {list.map((data) => (
                    <TouchableOpacity
                      key={data.espid}
                      onPress={() => {
                        setSelectedDevice(data.espid);
                        handleChangeList(data.espid);
                        setModalVisible(false);
                      }}
                      style={{
                        padding: 10,
                        backgroundColor:
                          activityMap[data.espid] ? 'lightgreen' : 'white',
                      }}
                    >
                      <Text
                        style={{
                          color: activityMap[data.espid] ? 'black' : '#758f75',
                          fontWeight: activityMap[data.espid] ? 'bold' : 'normal',
                        }}
                      >
                        {formatName(data.name, 12)}
                        {'  '}
                        {actionMap[data.espid] || '...'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <Button title="Cerrar" onPress={() => setModalVisible(false)} />
              </View>
            </View>
          </Modal>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Ubicaciones</Text>
          {renderMap}
          {/* <MapView
            style={styles.map}
            initialRegion={{
              latitude: focus[0],
              longitude: focus[1],
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
          >
            {ubicaciones.map((ubicacion, index) => (
              <Marker
                key={index}
                coordinate={{
                  latitude: ubicacion.lat,
                  longitude: ubicacion.lng,
                }}
                title={ubicacion.nombre}
                description={`Voltaje: ${ubicacion.voltageCFE}, Temp: ${ubicacion.temperatura}`}
              />
            ))}
          </MapView> */}
          <TextInput
            style={styles.input}
            placeholder="Latitud"
            value={lat.toString()}
            editable={false}
          />
          <TextInput
            style={styles.input}
            placeholder="Longitud"
            value={lng.toString()}
            editable={false}
          />
        </View>

        <View style={styles.card}>
          <Button
            title="Clear LocalStorage"
            onPress={handleClearLocalStorage}
            color="#f44336"
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Add Item</Text>
          <TextInput
            style={styles.input}
            placeholder="Add Item"
            value={value}
            onChangeText={setValue}
          />
          <Button title="Add" onPress={handleAdd} color="#4CAF50" />
        </View>

        <View style={styles.card}>
          <Button title="Download List" onPress={handleDownloadList} />
        </View>
      </View>

      {/* Grupo Central */}
      <View style={styles.column}>
        <View style={styles.card}>
          <Text style={styles.title}>Device Configuration</Text>

          {['DeviceID', 'IP', 'Server', 'Time', 'Token', 'Database', 'Ubicación', 'Zona', 'updatepass'].map((field) => (
            <View key={field} style={{ marginBottom: 10 }}>
              <TextInput
                style={styles.input}
                placeholder={field}
                value={currentID[field] || ''}
                onChangeText={(text) => handleChangeDevice(field, text)}
              />
              <Button
                title={`Send ${field}`}
                onPress={() => handleSubmiteElements(field)}
                color="#4CAF50"
              />
            </View>
          ))}
        </View>
      </View>

      {/* Grupo Derecho */}
      <View style={styles.column}>
        <View style={styles.card}>
          <Text style={styles.title}>Device Actions</Text>

          <View style={styles.toggleContainer}>
            <Text>RELE 1</Text>
            <ToggleButton
              state={Toggled1}
              onChange={() => handleToggle(3, Toggled1, setToggled1)}
            />
          </View>

          <View style={styles.toggleContainer}>
            <Text>RELE 2</Text>
            <ToggleButton
              state={Toggled2}
              onChange={() => handleToggle(4, Toggled2, setToggled2)}
            />
          </View>

          <View style={{ marginVertical: 10 }}>
            <Text>Select Type</Text>
            <View style={styles.radioContainer}>
              <Text>Sketch</Text>
              <RadioButton.Group
  onValueChange={newValue => {
    setSelectedOption(newValue);
    setUrl(prevUrl => 
      newValue === 'sketch' 
        ? prevUrl.replace('spiffs', 'sketch') 
        : prevUrl.replace('sketch', 'spiffs')
    );
  }}
  value={selectedOption}
>
  <View style={styles.radioItem}>
    <Text>Sketch</Text>
    <RadioButton value="sketch" />
  </View>
  <View style={styles.radioItem}>
    <Text>SPIFFS</Text>
    <RadioButton value="spiffs" />
  </View>
</RadioButton.Group>
            </View>

            <TextInput
              style={styles.input}
              placeholder="URL"
              value={url}
              onChangeText={setUrl}
            />
            <Button
              title={`Update with this ${selectedOption}`}
              onPress={handleSubmiturl}
              color="#2196F3"
            />
          </View>

          <Text style={{ marginVertical: 10 }}>
            Versión Compilación: {currentID['Compilation'] || ''}
          </Text>

          <TextInput
            style={styles.input}
            placeholder="offset"
            value={off.toString()}
            onChangeText={setOff}
            keyboardType="numeric"
          />
          <Button
            title="Ajustar offset de la batería"
            onPress={handleSetOffset}
            color="#2196F3"
          />

          <Text style={{ marginVertical: 10 }}>
            Password de administración: {encrypted}
          </Text>

          <Button
            title="GBIC run updatedatas"
            onPress={handleupdatedatas}
            color="#4CAF50"
            style={{ marginVertical: 5 }}
          />

          <Button
            title="GBIC upload sensors status"
            onPress={handlegetstatusupload}
            color="#4CAF50"
            style={{ marginVertical: 5 }}
          />

          <Text style={{ marginVertical: 10 }}>
            Última actividad: {lastAct || 'Sin actividad reciente'}
          </Text>

          <Button
            title="Últimos datos medidos"
            onPress={handlegetlastdatas}
            color="#4CAF50"
            style={{ marginVertical: 5 }}
          />

          <Text style={{ marginVertical: 10 }}>{lastDatas}</Text>
        </View>
      </View>
    </ScrollView>
  );
}

export default DevicesBendita;