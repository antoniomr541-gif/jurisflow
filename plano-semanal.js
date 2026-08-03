
// AulaFácil V7 - Plano Semanal
// Estrutura inicial do módulo de planejamento pedagógico

let weeklyPlan = JSON.parse(localStorage.getItem('aulaFacilWeeklyPlan') || '[]');

function addActivityToWeeklyPlan(activity, day, homework=false){
  weeklyPlan.push({
    id: Date.now(),
    day,
    homework,
    activity,
    createdAt: new Date().toISOString()
  });
  localStorage.setItem('aulaFacilWeeklyPlan', JSON.stringify(weeklyPlan));
}

function getWeeklyPlan(){
  return weeklyPlan;
}

function generateWeeklyPlanData(profile, week){
  return {
    school: profile.school || '',
    teacher: profile.name || '',
    week,
    objectives: [],
    bnccSkills: [],
    activities: weeklyPlan,
    resources: [],
    evaluation: ''
  };
}
