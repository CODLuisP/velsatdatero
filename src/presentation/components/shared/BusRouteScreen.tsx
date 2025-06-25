// import React from 'react';
// import {View, Text, StyleSheet, ScrollView, SafeAreaView} from 'react-native';
// import {IonIcon} from './IonIcon';

// interface BusStop {
//   id: string;
//   name: string;
//   description: string;
//   arrivalTime: string;
//   estimatedTime: string;
//   actualTime?: string;
//   duration: string;
//   icon: string;
//   isActive?: boolean;
//   isCompleted?: boolean; 
//   isTerminal?: boolean;
// }

// const busStops: BusStop[] = [
//   {
//     id: '1',
//     name: 'Estación Central',
//     description: 'Punto de inicio',
//     arrivalTime: '16:05',
//     estimatedTime: '16:05',
//     actualTime: '16:05:20', 
//     duration: '+0:20',
//     icon: 'bus',
//     isCompleted: true,
//   },
//   {
//     id: '2',
//     name: 'Plaza Principal',
//     description: 'Paradero 1',
//     arrivalTime: '16:17',
//     estimatedTime: '',
//     duration: '+0:00',
//     icon: 'location',
//     isCompleted: true, 
//   },
//   {
//     id: '3',
//     name: 'Hospital General',
//     description: 'Paradero 2',
//     arrivalTime: '16:28',
//     estimatedTime: '',
//     duration: '11 min',
//     icon: 'location',
//     isActive: true, 

//   },
//   {
//     id: '4',
//     name: 'Parque Industrial',
//     description: 'Paradero 3',
//     arrivalTime: '16:40',
//     estimatedTime: '',
//     duration: '23 min',
//     icon: 'location',
//   },
//   {
//     id: '5',
//     name: 'Centro Comercial',
//     description: 'Paradero 4',
//     arrivalTime: '16:47',
//     estimatedTime: '',
//     duration: '30 min',
//     icon: 'location',
//   },
//   {
//     id: '6',
//     name: 'Terminal Norte',
//     description: 'Punto final',
//     arrivalTime: '17:00',
//     estimatedTime: '',
//     duration: '43 min',
//     icon: 'location-outline',
//     isTerminal: true,
//   },
// ];

// const BusStopItem: React.FC<{stop: BusStop}> = ({stop}) => {
//   const renderTimeColumns = () => {
//     if (stop.isActive) {
//       // Fila activa: solo 2 columnas (hora programada | retraso)
//       return (
//         <>
//           <View style={styles.timeColumn}>
//             <Text style={[styles.timeValue, styles.activeTimeValue]}>
//               {stop.arrivalTime}
//             </Text>
//           </View>
          
//           <View style={[styles.verticalDivider, styles.activeVerticalDivider]} />
          
//           <View style={styles.activeTag}>
//             <Text style={styles.activeTagText}>{stop.duration}</Text>
//           </View>
//         </>
//       );
//     } else if (stop.isCompleted) {
//       // Fila completada: 3 columnas (programada | real | retraso)
//       return (
//         <>
//           <View style={styles.timeColumn}>
//             <Text style={styles.timeValue}>{stop.arrivalTime}</Text>
//           </View>
          
//           <View style={styles.verticalDivider} />
          
//           <View style={styles.timeColumn}>
//             <Text style={styles.timeValue}>{stop.actualTime}</Text>
//           </View>
          
//           <View style={styles.verticalDivider} />
          
//           <View style={styles.durationContainer}>
//             <Text style={[
//               styles.durationText,
//               stop.duration.includes('+') && styles.delayText
//             ]}>
//               {stop.duration}
//             </Text>
//           </View>
//         </>
//       );
//     } else {
//       // Filas futuras: 2 columnas (programada | tiempo estimado)
//       return (
//         <>
//           <View style={styles.timeColumn}>
//             <Text style={styles.timeValue}>{stop.arrivalTime}</Text>
//           </View>
          
//           <View style={styles.verticalDivider} />
          
//           <View style={styles.durationContainer}>
//             <Text style={styles.durationText}>{stop.duration}</Text>
//           </View>
//         </>
//       );
//     }
//   };

//   return (
//     <View style={[
//       styles.stopContainer,
//       stop.isActive && styles.activeStopContainer,
//       stop.isCompleted && styles.completedStopContainer
//     ]}>
//       <View style={styles.iconContainer}>
//         <View
//           style={[
//             styles.iconCircle,
//             stop.isActive && styles.activeIconCircle,
//             stop.isCompleted && styles.completedIconCircle,
//             stop.isTerminal && styles.terminalIconCircle,
//           ]}>
//           <IonIcon
//             name={stop.icon}
//             size={stop.isActive ? 24 : 20}
//             color={
//               stop.isActive ? '#fff' : 
//               stop.isCompleted ? '#fff' :
//               stop.isTerminal ? '#666' : '#666'
//             }
//           />
//         </View>
//       </View>

//       <View style={styles.contentContainer}>
//         <View style={styles.stopInfo}>
//           <Text style={[
//             styles.stopName,
//             stop.isActive && styles.activeStopName,
//             stop.isCompleted && styles.completedStopName
//           ]}>
//             {stop.name}
//           </Text>
//           <Text style={[
//             styles.stopDescription,
//             stop.isActive && styles.activeStopDescription,
//             stop.isCompleted && styles.completedStopDescription
//           ]}>
//             {stop.description}
//           </Text>
//         </View>
        
//         <View style={[
//           styles.verticalDivider,
//           stop.isActive && styles.activeVerticalDivider
//         ]} />
        
//         {renderTimeColumns()}
//       </View>
//     </View>
//   );
// };

// const BusRouteScreenComlete: React.FC = () => {
//   return (
//     <SafeAreaView style={styles.container}>
//       <ScrollView
//         style={styles.scrollView}
//         showsVerticalScrollIndicator={false}>
//         {busStops.map((stop, index) => (
//           <View key={stop.id}>
//             <BusStopItem stop={stop} />
//             {index < busStops.length - 1 && <View style={[
//               styles.connector,
//               stop.isCompleted && styles.completedConnector
//             ]} />}
//           </View>
//         ))}
//       </ScrollView>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f5f5f5',
//   },
//   scrollView: {
//     flex: 1,
//     paddingHorizontal: 2,
//     paddingTop: 6,
//     marginBottom: 10,
//   },
//   stopContainer: {
//     flexDirection: 'row',
//     backgroundColor: '#fff',
//     padding: 5,
//     marginBottom: 0,
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: 1,
//     },
//     shadowOpacity: 0.1,
//     shadowRadius: 2,
//     elevation: 2,
//   },
//   activeStopContainer: {
//     backgroundColor: '#ffebee',
//     borderLeftWidth: 4,
//     borderLeftColor: '#f44336',
//     padding: 8,
//     shadowOpacity: 0.2,
//     elevation: 4,
//   },
//   completedStopContainer: {
//     backgroundColor: '#f1f8e9',
//     borderLeftWidth: 4,
//     borderLeftColor: '#4caf50',
//   },
//   iconContainer: {
//     marginRight: 16,
//     alignItems: 'center',
//   },
//   iconCircle: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: '#f0f0f0',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   activeIconCircle: {
//     backgroundColor: '#f44336',
//     width: 44,
//     height: 44,
//     borderRadius: 22,
//     shadowColor: '#f44336',
//     shadowOffset: {
//       width: 0,
//       height: 2,
//     },
//     shadowOpacity: 0.3,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   completedIconCircle: {
//     backgroundColor: '#4caf50',
//   },
//   terminalIconCircle: {
//     backgroundColor: '#f0f0f0',
//     borderWidth: 2,
//     borderColor: '#666',
//   },
//   contentContainer: {
//     flex: 1,
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   stopInfo: {
//     flex: 1,
//   },
//   stopName: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#333',
//     marginBottom: 0,
//   },
//   activeStopName: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: '#d32f2f',
//     letterSpacing: 0.5,
//   },
//   completedStopName: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#2e7d32',
//   },
//   stopDescription: {
//     fontSize: 14,
//     color: '#666',
//   },
//   activeStopDescription: {
//     fontSize: 15,
//     fontWeight: '600',
//     color: '#c62828',
//   },
//   completedStopDescription: {
//     fontSize: 14,
//     color: '#212529',
//   },
//   verticalDivider: {
//     width: 1,
//     height: '70%',
//     backgroundColor: '#e0e0e0',
//     marginHorizontal: 8,
//   },
//   activeVerticalDivider: {
//     backgroundColor: '#f44336',
//     width: 2,
//   },
//   timeColumn: {
//     alignItems: 'center',
//     minWidth: 50,
//   },
//   timeValue: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#333',
//   },
//   activeTimeValue: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: '#d32f2f',
//     textShadowColor: 'rgba(212, 47, 47, 0.3)',
//     textShadowOffset: {width: 1, height: 1},
//     textShadowRadius: 2,
//   },
//   activeTag: {
//     backgroundColor: '#f44336',
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 6,
//     marginLeft: 8,
//     shadowColor: '#f44336',
//     shadowOffset: {
//       width: 0,
//       height: 2,
//     },
//     shadowOpacity: 0.4,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   activeTagText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: '700',
//     letterSpacing: 0.5,
//   },
//   durationContainer: {
//     alignItems: 'center',
//     marginLeft: 8,
//     minWidth: 50,
//   },
//   durationText: {
//     fontSize: 15,
//     fontWeight: '500',
//     color: '#333',
//   },
//   delayText: {
//     color: '#f44336',
//     fontWeight: '600',
//   },
//   connector: {
//     width: 1,
//     height: 8,
//     backgroundColor: '#00509d',
//     marginLeft: 25,
//     marginVertical: 0,
//   },
//   completedConnector: {
//     backgroundColor: '#4caf50',
//   },
// });

// export default BusRouteScreenComlete;