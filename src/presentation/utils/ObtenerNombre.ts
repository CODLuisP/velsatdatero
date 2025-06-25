// utils.js
export const getNombreDescripcion = (nombre:string) => {
    switch (nombre) {
      case "INI":
        return "INI";
      case "VEN":
        return "VEN";
      case "PAC":
        return "PAC";
      case "GRZ":
        return "GRZ";
      case "OBR":
        return "OBR";
      case "SJU":
        return "SJU";
      case "ARR":
        return "ARR";
      case "MAD":
        return "MAD";
      case "CT":
        return "CT";
      case "TRA":
        return "TRA";
      case "COR":
        return "COR";
      case "GRI":
        return "GRI";
      case "SCR":
        return "SCR";
      case "INS":
        return "INS";
      default:
        return nombre;
    }
  };
  
  export const formatPlaca = (nombreplaca: string | null): string => {
    if (!nombreplaca) {
      return 'XX'; // Valor predeterminado para casos nulos
    }
  
    if (/^[A-Za-z]/.test(nombreplaca)) {
      // Si comienza con una letra
      return nombreplaca.substring(0, 3);
    } else if (/^\d[^A-Za-z0-9]/.test(nombreplaca)) {
      return `00${nombreplaca.substring(0, 1)}`;
    } else {
      // Si comienza con un número o cualquier otra cosa
      return `0${nombreplaca.substring(0, 2)}`;
    }
  };