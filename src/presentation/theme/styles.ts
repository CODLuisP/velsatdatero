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
    alignItems: 'center',
    justifyContent: 'center',
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
    paddingHorizontal: 10,
    textAlign: 'center',
    fontSize: 20,
    justifyContent: 'space-between',
    alignItems: 'center',
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
    backgroundColor: '#003f88',
    marginVertical: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    flexGrow: 1,
  },

  valueTimes: {
    fontWeight: 'bold',
    color: '#fff',
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

  // ===== ESTILOS ACTUALIZADOS PARA EL MAPA =====
  
  // Caja de información - arriba a la derecha
  infoBox: {
    position: 'absolute',
    top: 20,
    right: 15,
    backgroundColor: 'rgba(31, 41, 55, 0.95)', // Fondo oscuro semi-transparente
    padding: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    zIndex: 1000,
    alignItems: 'center',
    maxWidth: 200,
    minWidth: 140,
    // Sombra elegante
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
    // Borde sutil
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },

  // Versión para modal con menos margen superior
  infoBoxModal: {
    top: 10,
  },

  infoText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 4,
    letterSpacing: 0.5,
  },

  infoDir: {
    fontSize: 14,
    fontWeight: '500',
    color: '#D1D5DB',
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: 4,
  },

  // Contenedor principal del mapa
  mapContainer: {
    flex: 1,
  },

  // WebView del mapa
  webView: {
    flex: 1,
  },

  // ===== ESTILOS PARA EL MODAL =====
  
  // Overlay del modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Contenedor del modal
  modalContainer: {
    backgroundColor: 'white',
    width: '95%',
    height: '85%',
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },

  // Header del modal
  modalHeader: {
    backgroundColor: '#113EB9',
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  modalTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },

  modalHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  modalTimer: {
    color: 'white',
    marginRight: 10,
    fontSize: 14,
    fontWeight: '500',
  },

  modalCloseButton: {
    padding: 4,
    borderRadius: 4,
  },

  modalContent: {
    flex: 1,
  },

  // ===== ESTILOS PARA ESTADOS VACÍOS Y ADVERTENCIAS =====
  
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  errorText: {
    color: 'red',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '500',
  },

  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },

  emptyStateCard: {
    backgroundColor: '#fff',
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    height: '100%',
  },

  emptyStateIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fff3e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },

  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
    textAlign: 'center',
    marginBottom: 8,
  },

  emptyStateSubtitle: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 20,
  },

  warningContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff3cd',
  },

  warningContent: {
    backgroundColor: '#fff3cd',
    alignItems: 'center',
    padding: 20,
  },

  warningIcon: {
    backgroundColor: '#ffeeba',
    padding: 12,
    marginBottom: 10,
    borderRadius: 50,
  },

  warningText: {
    color: '#856404',
    fontSize: 16,
    textAlign: 'center',
  },

  vehicleListContainer: {
    flexGrow: 1,
    alignContent: 'center',
    justifyContent: 'center',
  },

  // ===== ESTILOS EXISTENTES (sin cambios) =====

  returnButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    position: 'absolute',
    bottom: 20,
    left: 20,
    zIndex: 1,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#374151',
  },

  iconBack: {
    marginRight: 2,
    color: '#FFFFFF',
  },

  returnButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
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
    color: '#212529',
  },

  location: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 2,
    color: '#212529',
  },

  copyright: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 2,
    color: '#212529',
  },

  tituloSide: {
    fontSize: 18,
    color: '#003566',
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