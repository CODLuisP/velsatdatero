import {StyleSheet} from 'react-native';

export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  control: {
    flexDirection: 'column',
    gap: 10,
  },

  containerRuta: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#a6a2a2',
  },

  containerLeftRuta: {
    flex: 2,
  },

  containerRightRuta: {
    flex: 1,
    maxWidth: '22%',
    justifyContent: 'space-between',
    marginLeft: 5,
    marginBottom: 3,
  },

    titleModoContainer: {
    flexDirection: 'row',
    alignItems: 'center',      // Centrado vertical
    justifyContent: 'center',  // Centrado horizontal
    padding: 10,
    backgroundColor: '#2196f3',
    marginVertical: 10,
  },
  
  titleRuta: {
    color: '#ffffff',
    textAlign: 'center',
    fontSize: 20,
    justifyContent: 'space-between',
  },

    titleModo: {
    color: '#ffffff',
    paddingHorizontal:10,
    textAlign: 'center',
    fontSize: 20,
    justifyContent: 'space-between',
    alignItems:'center',
  },


  title2Ruta: {
    backgroundColor: '#0d47a1',
    color: '#ffffff',
    textAlign: 'center',
    fontSize: 20,
    borderRadius: 10,
    padding: 8,
  },

  containerUnit: {
    marginVertical: 1.5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: '#e9ecef',
    paddingLeft: 15,
  },
  containerTimes: {
    backgroundColor: '#93c5fd',
    marginVertical: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    flexGrow: 1,
  },

  valueTimes: {
    fontWeight: 'bold',
    color: '#003566',
    paddingVertical: 5,
  },

  valueTimesControl: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    paddingVertical: 5,
  },
  valueTimesDiff: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
    textAlignVertical: 'center',
    backgroundColor: '#ffb703',
    width: 40,
    height: 40,
    borderRadius: 1,
  },

  icon: {
    fontSize: 25,
  },

  name: {
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
    marginLeft: '1%',
    paddingRight: 50,
  },

  time: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: 'bold',
    flex: 1,
  },

  pos: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: 'bold',
    flex: 1,
  },

  pos2: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: 'bold',
    flex: 1,
  },

  infoBox: {
    position: 'absolute',
    top: '10%', // Ajusta la posición según sea necesario
    left: '36.5%',
    backgroundColor: '#FB7B0F',
    padding: 10,
    borderRadius: 8,
    zIndex: 1,
    alignItems: 'center',
    maxWidth: 300,
  },
  infoText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  infoDir: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  returnButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FB7B0F',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    position: 'absolute',
    bottom: 20,
    left: 20,
    zIndex: 1,
  },
  iconBack: {
    marginRight: 2,
  },
  returnButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },

  containerControlText: {
    alignItems: 'center',
    justifyContent: 'center',
    color: '#000',
  },
  version: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 2,
    color: '#343a40',
  },

  location: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 2,
    color: '#343a40',
  },
  copyright: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 2,
    color: '#343a40',
  },

  tituloSide: {
    fontSize: 18,
    color: '#113eb9',
    fontWeight: 'bold',
    alignSelf: 'center',
  },

  zoomButtons: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    alignItems: 'center',
  },
  zoomButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 4,
    elevation: 4,
  },
  zoomText: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#333',
  },
});
