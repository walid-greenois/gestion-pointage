// Calculate distance between two coordinates in meters
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

// Check if user is within allowed radius
function isWithinAllowedRadius(userLocation, companyLocation, allowedRadius) {
  const distance = calculateDistance(
    userLocation.latitude,
    userLocation.longitude,
    companyLocation.latitude,
    companyLocation.longitude
  );
  
  return distance <= allowedRadius;
}

// Calculate work hours between two time strings
function calculateWorkHours(checkInTime, checkOutTime) {
  const [inHours, inMinutes] = checkInTime.split(':').map(Number);
  const [outHours, outMinutes] = checkOutTime.split(':').map(Number);
  
  const inDate = new Date();
  inDate.setHours(inHours, inMinutes, 0, 0);
  
  const outDate = new Date();
  outDate.setHours(outHours, outMinutes, 0, 0);
  
  const diffMs = outDate - inDate;
  const diffHours = diffMs / (1000 * 60 * 60);
  
  return Math.round(diffHours * 100) / 100; // Round to 2 decimal places
}

// Check if check-in is late
function isLate(checkInTime, scheduledTime, gracePeriodMinutes = 15) {
  const [checkHours, checkMinutes] = checkInTime.split(':').map(Number);
  const [schedHours, schedMinutes] = scheduledTime.split(':').map(Number);
  
  const checkDate = new Date();
  checkDate.setHours(checkHours, checkMinutes, 0, 0);
  
  const schedDate = new Date();
  schedDate.setHours(schedHours, schedMinutes, 0, 0);
  
  const diffMs = checkDate - schedDate;
  const diffMinutes = diffMs / (1000 * 60);
  
  return diffMinutes > gracePeriodMinutes;
}

// Check if check-out is early departure
function isEarlyDeparture(checkOutTime, scheduledTime) {
  const [outHours, outMinutes] = checkOutTime.split(':').map(Number);
  const [schedHours, schedMinutes] = scheduledTime.split(':').map(Number);
  
  const outDate = new Date();
  outDate.setHours(outHours, outMinutes, 0, 0);
  
  const schedDate = new Date();
  schedDate.setHours(schedHours, schedMinutes, 0, 0);
  
  const diffMs = outDate - schedDate;
  const diffMinutes = diffMs / (1000 * 60);
  
  return diffMinutes < 0;
}

module.exports = {
  calculateDistance,
  isWithinAllowedRadius,
  calculateWorkHours,
  isLate,
  isEarlyDeparture
};
