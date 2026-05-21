import { type FormEvent, useEffect, useMemo, useState } from 'react'

type Workout = {
  id: string
  name: string
  type: string
  duration: number
  calories: number
  distance: number
  notes: string
  date: string
}

type Goal = {
  id: string
  label: string
  target: number
  unit: string
  progress: number
  period: string
}

const storageKey = 'fitness-tracking-data'

const starterWorkouts: Workout[] = [
  {
    id: 'w-1',
    name: 'Morning Run',
    type: 'Running',
    duration: 35,
    calories: 320,
    distance: 5.2,
    notes: 'Felt strong, steady pace',
    date: '2026-05-16T06:45',
  },
  {
    id: 'w-2',
    name: 'Strength Circuit',
    type: 'Strength',
    duration: 50,
    calories: 410,
    distance: 0,
    notes: 'Upper body + core',
    date: '2026-05-15T18:10',
  },
  {
    id: 'w-3',
    name: 'Yoga Flow',
    type: 'Yoga',
    duration: 40,
    calories: 160,
    distance: 0,
    notes: 'Recovery focus',
    date: '2026-05-14T07:20',
  },
  {
    id: 'w-4',
    name: 'Cycling Session',
    type: 'Cycling',
    duration: 45,
    calories: 380,
    distance: 14.8,
    notes: 'Intervals and climbs',
    date: '2026-05-13T17:45',
  },
]

const starterGoals: Goal[] = [
  {
    id: 'g-steps',
    label: 'Daily step target',
    target: 10000,
    unit: 'steps',
    progress: 8450,
    period: 'Today',
  },
  {
    id: 'g-workouts',
    label: 'Weekly workout hours',
    target: 6,
    unit: 'hours',
    progress: 4.2,
    period: 'This week',
  },
  {
    id: 'g-calories',
    label: 'Monthly calorie burn',
    target: 12000,
    unit: 'kcal',
    progress: 7380,
    period: 'This month',
  },
  {
    id: 'g-weight',
    label: 'Weight loss goal',
    target: 6,
    unit: 'kg',
    progress: 2.4,
    period: '90 days',
  },
]

const summaryCards = [
  { label: 'Total Steps', value: '8,450', note: '+12% vs yesterday' },
  { label: 'Calories Burned', value: '620', note: 'Daily average 540' },
  { label: 'Workout Duration', value: '1h 25m', note: '2 sessions logged' },
  { label: 'Active Minutes', value: '68', note: 'Goal 75 min' },
]

const weeklyTrend = [
  { day: 'Mon', value: 60 },
  { day: 'Tue', value: 78 },
  { day: 'Wed', value: 52 },
  { day: 'Thu', value: 86 },
  { day: 'Fri', value: 68 },
  { day: 'Sat', value: 92 },
  { day: 'Sun', value: 55 },
]

const weeklyCalories = [
  { day: 'Mon', value: 420 },
  { day: 'Tue', value: 530 },
  { day: 'Wed', value: 380 },
  { day: 'Thu', value: 610 },
  { day: 'Fri', value: 480 },
  { day: 'Sat', value: 700 },
  { day: 'Sun', value: 410 },
]

const sanitizeText = (value: string) => value.trim()

const createId = () =>
  `item-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`

const loadStoredData = () => {
  if (typeof window === 'undefined') {
    return { workouts: starterWorkouts, goals: starterGoals }
  }

  try {
    const raw = window.localStorage.getItem(storageKey)
    if (!raw) return { workouts: starterWorkouts, goals: starterGoals }
    const parsed = JSON.parse(raw)
    return {
      workouts: Array.isArray(parsed?.workouts) ? parsed.workouts : starterWorkouts,
      goals: Array.isArray(parsed?.goals) ? parsed.goals : starterGoals,
    }
  } catch {
    return { workouts: starterWorkouts, goals: starterGoals }
  }
}

function ProgressRing({ value, label, color }: { value: number; label: string; color: string }) {
  const radius = 44
  const stroke = 10
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - value)

  return (
    <div className="ring">
      <svg width="120" height="120" viewBox="0 0 120 120">
        <circle
          cx="60"
          cy="60"
          r={radius}
          stroke="rgba(148, 163, 184, 0.25)"
          strokeWidth={stroke}
          fill="transparent"
        />
        <circle
          cx="60"
          cy="60"
          r={radius}
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          fill="transparent"
        />
      </svg>
      <div className="ring-label">
        <strong>{Math.round(value * 100)}%</strong>
        <span>{label}</span>
      </div>
    </div>
  )
}

function App() {
  const stored = loadStoredData()
  const [workouts, setWorkouts] = useState<Workout[]>(stored.workouts)
  const [goals, setGoals] = useState<Goal[]>(stored.goals)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('All')
  const [formState, setFormState] = useState({
    name: '',
    type: 'Running',
    duration: '',
    calories: '',
    distance: '',
    notes: '',
    date: '',
  })
  const [formError, setFormError] = useState('')

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify({ workouts, goals }))
  }, [workouts, goals])

  const filteredWorkouts = useMemo(() => {
    return workouts.filter((workout) => {
      const matchesSearch = workout.name
        .toLowerCase()
        .includes(searchQuery.trim().toLowerCase())
      const matchesType = filterType === 'All' || workout.type === filterType
      return matchesSearch && matchesType
    })
  }, [workouts, searchQuery, filterType])

  const totalWorkoutMinutes = workouts.reduce((sum, item) => sum + item.duration, 0)
  const totalCalories = workouts.reduce((sum, item) => sum + item.calories, 0)

  const handleAddWorkout = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const name = sanitizeText(formState.name)
    const duration = Number(formState.duration)
    const calories = Number(formState.calories)
    const distance = Number(formState.distance) || 0
    const date = formState.date || new Date().toISOString().slice(0, 16)

    if (!name || !duration || !calories) {
      setFormError('Please provide a name, duration, and calories burned.')
      return
    }

    const newWorkout: Workout = {
      id: createId(),
      name,
      type: formState.type,
      duration,
      calories,
      distance,
      notes: sanitizeText(formState.notes),
      date,
    }

    setWorkouts((prev) => [newWorkout, ...prev])
    setFormState({
      name: '',
      type: 'Running',
      duration: '',
      calories: '',
      distance: '',
      notes: '',
      date: '',
    })
    setFormError('')
  }

  const handleGoalChange = (goalId: string, value: number) => {
    setGoals((prev) =>
      prev.map((goal) =>
        goal.id === goalId ? { ...goal, progress: value } : goal,
      ),
    )
  }

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span className="brand-dot" />
          <div>
            <p className="brand-label">Fitness Suite</p>
            <h1>PulseTrack</h1>
          </div>
        </div>
        <nav className="nav" aria-label="Primary">
          <a href="#dashboard">Dashboard</a>
          <a href="#activities">Activities</a>
          <a href="#analytics">Analytics</a>
          <a href="#goals">Goals</a>
          <a href="#profile">Profile</a>
        </nav>
        <button className="cta" type="button">
          Sync wearable
        </button>
      </header>

      <section className="hero" id="dashboard">
        <div>
          <p className="eyebrow">Daily Performance</p>
          <h2>Stay consistent, track smarter, and celebrate every milestone.</h2>
          <p className="subtext">
            A unified fitness workspace that brings activity tracking, workout
            history, and progress analytics into a single motivational view.
          </p>
          <div className="hero-stats">
            <div>
              <span>Workout minutes</span>
              <strong>{totalWorkoutMinutes} min</strong>
            </div>
            <div>
              <span>Total calories</span>
              <strong>{totalCalories} kcal</strong>
            </div>
            <div>
              <span>Weekly goal</span>
              <strong>70% complete</strong>
            </div>
          </div>
        </div>
        <div className="hero-card">
          <h3>Weekly Completion</h3>
          <div className="rings">
            <ProgressRing value={0.68} label="Cardio" color="#20c997" />
            <ProgressRing value={0.52} label="Strength" color="#4f46e5" />
            <ProgressRing value={0.74} label="Recovery" color="#fb923c" />
          </div>
          <div className="hero-note">
            <span>Next milestone</span>
            <p>2 more workouts to beat last week.</p>
          </div>
        </div>
      </section>

      <section className="grid" aria-label="Daily summary">
        {summaryCards.map((card) => (
          <div className="summary-card" key={card.label}>
            <p>{card.label}</p>
            <strong>{card.value}</strong>
            <span>{card.note}</span>
          </div>
        ))}
        <div className="summary-card highlight">
          <p>Hydration</p>
          <strong>2.1 L</strong>
          <span>Goal 2.5 L today</span>
        </div>
      </section>

      <section className="dashboard-grid">
        <div className="panel">
          <div className="panel-head">
            <div>
              <h3>Weekly activity</h3>
              <p>Active minutes this week</p>
            </div>
            <button type="button" className="ghost">
              View report
            </button>
          </div>
          <div className="bar-chart">
            {weeklyTrend.map((item) => (
              <div key={item.day} className="bar">
                <div style={{ height: `${item.value}%` }} />
                <span>{item.day}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="panel">
          <div className="panel-head">
            <div>
              <h3>Activity breakdown</h3>
              <p>Cardio vs strength vs recovery</p>
            </div>
            <span className="pill">Last 7 days</span>
          </div>
          <div className="donut" aria-hidden="true"></div>
          <div className="legend">
            <span><i style={{ background: '#20c997' }}></i>Cardio 40%</span>
            <span><i style={{ background: '#4f46e5' }}></i>Strength 32%</span>
            <span><i style={{ background: '#fb923c' }}></i>Recovery 28%</span>
          </div>
        </div>
        <div className="panel wide">
          <div className="panel-head">
            <div>
              <h3>Calories burned</h3>
              <p>Daily calorie output trend</p>
            </div>
            <span className="pill">This week</span>
          </div>
          <div className="line-chart">
            {weeklyCalories.map((item) => (
              <div key={item.day} className="line-point" style={{ height: `${item.value / 8}px` }}>
                <span>{item.day}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="panel" id="activities">
        <div className="panel-head">
          <div>
            <h3>Manual activity logging</h3>
            <p>Log workouts, track details, and keep your history complete.</p>
          </div>
          <span className="pill">Manual entry</span>
        </div>
        <form className="form" onSubmit={handleAddWorkout}>
          <div className="field">
            <label>Exercise name</label>
            <input
              value={formState.name}
              onChange={(event) => setFormState({ ...formState, name: event.target.value })}
              placeholder="Morning Run"
            />
          </div>
          <div className="field">
            <label>Exercise type</label>
            <select
              value={formState.type}
              onChange={(event) => setFormState({ ...formState, type: event.target.value })}
            >
              {['Running', 'Cycling', 'Gym', 'Yoga', 'Swimming', 'Strength', 'Custom'].map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Duration (minutes)</label>
            <input
              type="number"
              min="0"
              value={formState.duration}
              onChange={(event) => setFormState({ ...formState, duration: event.target.value })}
              placeholder="45"
            />
          </div>
          <div className="field">
            <label>Calories burned</label>
            <input
              type="number"
              min="0"
              value={formState.calories}
              onChange={(event) => setFormState({ ...formState, calories: event.target.value })}
              placeholder="350"
            />
          </div>
          <div className="field">
            <label>Distance (optional)</label>
            <input
              type="number"
              min="0"
              step="0.1"
              value={formState.distance}
              onChange={(event) => setFormState({ ...formState, distance: event.target.value })}
              placeholder="5.2"
            />
          </div>
          <div className="field">
            <label>Date and time</label>
            <input
              type="datetime-local"
              value={formState.date}
              onChange={(event) => setFormState({ ...formState, date: event.target.value })}
            />
          </div>
          <div className="field full">
            <label>Notes (optional)</label>
            <textarea
              rows={3}
              value={formState.notes}
              onChange={(event) => setFormState({ ...formState, notes: event.target.value })}
              placeholder="How did this workout feel?"
            />
          </div>
          {formError ? <p className="form-error">{formError}</p> : null}
          <button type="submit" className="cta">
            Save workout
          </button>
        </form>
      </section>

      <section className="panel" id="analytics">
        <div className="panel-head">
          <div>
            <h3>Workout history</h3>
            <p>Search and filter your recent sessions.</p>
          </div>
          <div className="filters">
            <input
              type="search"
              placeholder="Search workouts"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
            <select value={filterType} onChange={(event) => setFilterType(event.target.value)}>
              {['All', 'Running', 'Cycling', 'Gym', 'Yoga', 'Swimming', 'Strength', 'Custom'].map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="workout-list">
          {filteredWorkouts.map((workout) => (
            <article className="workout" key={workout.id}>
              <div>
                <h4>{workout.name}</h4>
                <p>{workout.type} - {new Date(workout.date).toLocaleString()}</p>
              </div>
              <div className="workout-meta">
                <span>{workout.duration} min</span>
                <span>{workout.calories} kcal</span>
                <span>{workout.distance ? `${workout.distance} km` : 'Indoor'}</span>
              </div>
            </article>
          ))}
          {!filteredWorkouts.length ? (
            <p className="empty">No workouts match your filters yet.</p>
          ) : null}
        </div>
      </section>

      <section className="panel" id="goals">
        <div className="panel-head">
          <div>
            <h3>Goal tracking</h3>
            <p>Adjust targets and keep progress visible.</p>
          </div>
          <span className="pill">Editable</span>
        </div>
        <div className="goals">
          {goals.map((goal) => (
            <div className="goal" key={goal.id}>
              <div>
                <h4>{goal.label}</h4>
                <p>{goal.period}</p>
              </div>
              <div className="goal-progress">
                <div>
                  <span>{goal.progress}</span>
                  <span> / {goal.target} {goal.unit}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={goal.target}
                  value={goal.progress}
                  onChange={(event) => handleGoalChange(goal.id, Number(event.target.value))}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="panel profile" id="profile">
        <div className="panel-head">
          <div>
            <h3>Profile</h3>
            <p>Personal fitness settings and professional summary.</p>
          </div>
          <span className="pill">User profile</span>
        </div>
        <div className="profile-grid">
          <div className="profile-card">
            <h4>Majid Hussain</h4>
            <p>
              +92-328-6418212 | malikmajid8933@gmail.com | Muzaffargarh, Punjab,
              Pakistan | linkedin.com/in/majid-hussain | github.com/majidhussain
            </p>
            <div className="profile-block">
              <h5>Professional Summary</h5>
              <p>
                Motivated Artificial Intelligence undergraduate at The Islamia University
                of Bahawalpur with hands-on experience in AI automation, UX/UI design,
                social media analytics, and web development. Passionate about applying
                machine learning, computer vision, and intelligent automation to solve
                real-world problems. Seeking an AI/ML internship or junior role at an
                innovative organization to contribute to cutting-edge AI solutions.
              </p>
            </div>
            <div className="profile-block">
              <h5>Research Interests</h5>
              <p>
                Artificial Intelligence in Robotics, Computer Vision, Autonomous Vehicles,
                Human-Robot Interaction, Intelligent Automation, Natural Language
                Processing, UX for AI Systems, Machine Learning Engineering.
              </p>
            </div>
          </div>
          <div className="profile-card">
            <h5>Education</h5>
            <ul>
              <li>
                The Islamia University of Bahawalpur - Bachelor of Engineering (AI),
                Oct 2024 - Jul 2028 (Expected).
              </li>
              <li>
                Al Razi Higher Secondary School, FSc Pre-Medical, Jul 2022 - Jun 2024.
              </li>
            </ul>
            <h5>Technical Skills</h5>
            <ul>
              <li>AI/ML and Data: ML, AI Automation, Neural Networks, Prompt Engineering.</li>
              <li>Programming and Web: Python (beginner), HTML, CSS, JavaScript (beginner).</li>
              <li>Design: UX/UI Design, Wireframing, Prototyping, Figma (beginner).</li>
              <li>Marketing: Social media strategy, SEO, YouTube growth, analytics.</li>
              <li>Tools: Google AI Suite, Coursera certifications, Git (beginner).</li>
            </ul>
            <h5>Soft Skills</h5>
            <ul>
              <li>Fast learner, problem-solving, collaborative, detail-oriented.</li>
              <li>Time management, bilingual (English and Urdu).</li>
            </ul>
          </div>
          <div className="profile-card">
            <h5>Experience</h5>
            <p className="role">Social Media Marketing and AI Automation Specialist</p>
            <p className="muted">Remote / Freelance - Nov 2025 to Dec 2026</p>
            <ul>
              <li>Streamlined content scheduling and engagement workflows with AI automation.</li>
              <li>Grew client social accounts through data-driven content strategies.</li>
              <li>Built YouTube growth strategies with SEO optimization and testing.</li>
              <li>Tracked campaign KPIs to maximize audience reach.</li>
            </ul>
            <h5>Projects</h5>
            <ul>
              <li>AI-Automated Social Media Analytics Dashboard (Python, AI Automation).</li>
              <li>UX/UI Redesign Prototype (Figma, User Research).</li>
              <li>Web Development Portfolio Site (HTML, CSS, JavaScript).</li>
            </ul>
            <h5>Certifications</h5>
            <ul>
              <li>Google AI Essentials - Google / Coursera (2025).</li>
              <li>UX/UI Design - Google / Coursera (2025).</li>
              <li>Cybersecurity Fundamentals - Google / Coursera (2025).</li>
              <li>App Development - Dev Castle Bahawalpur Centre (2025).</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  )
}

export default App
