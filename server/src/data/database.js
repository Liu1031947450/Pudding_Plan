const { mockPlans, mockHabits } = require('./mockData/planData');
const { mockBadges } = require('./mockData/badgeData');
const { mockNotifications } = require('./mockData/notificationData');
const { mockBuddies, mockCircles, mockLocations, mockTopics } = require('./mockData/communityData');
const { mockCalendarData, mockWeekRhythmData, mockMonthRhythmData } = require('./mockData/calendarData');
const { templateDetails } = require('./mockData/templates');

class Database {
  constructor() {
    this.plans = JSON.parse(JSON.stringify(mockPlans));
    this.badges = [...mockBadges];
    this.notifications = [...mockNotifications];
    this.buddies = [...mockBuddies];
    this.circles = [...mockCircles];
    this.calendar = [...mockCalendarData];
    this.habits = [...mockHabits];
    this.locations = [...mockLocations];
    this.topics = [...mockTopics];
    this.templates = templateDetails;
    this.weekRhythmData = [...mockWeekRhythmData];
    this.monthRhythmData = [...mockMonthRhythmData];
    
    this._initPlans();
  }

  _initPlans() {
    for (const plan of this.plans) {
      plan.currentDays = plan.completedDate.length;
      plan.days = plan.currentDays;
      plan.progress = Math.round((plan.currentDays / plan.totalDays) * 100);
    }
  }

  _getCompletedDays(plan) {
    return plan.completedDate.length;
  }

  _getProgress(plan) {
    return Math.round((this._getCompletedDays(plan) / plan.totalDays) * 100);
  }
}

const db = new Database();

module.exports = db;
