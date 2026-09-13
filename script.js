const workouts = [
  {
    short: "CORE",
    title: "Core ignition",
    focus: "CORE + CARDIO",
    time: "45–55 MIN",
    level: "HIGH",
    note: "Keep the ribs knitted toward the hips during ab work. For a low-impact version, step out every jump.",
    blocks: [
      {
        title: "WARM UP · 1 ROUND",
        moves: [
          ["5 MIN", "Easy jog or heel-to-butt march"],
          ["20 EA", "Standing stretch + cross-body crunch"],
          ["30", "Scissor kicks for lower abs"],
        ],
      },
      {
        title: "TWIST · 3 ROUNDS",
        moves: [
          ["30", "Hip-twist jumps"],
          ["30", "Plank twists"],
          ["15 EA", "Forearm reach-through twists"],
        ],
      },
      {
        title: "CORE · 3 ROUNDS",
        moves: [
          ["30", "Cross jacks"],
          ["20", "Crunches"],
          ["20", "Reverse crunches"],
        ],
      },
      {
        title: "FINISH · 3 ROUNDS",
        moves: [
          ["20", "Swan crunches"],
          ["15 EA", "Band-resisted side-lying leg raises"],
          ["30 SEC", "Fast feet or side-to-side hops"],
        ],
      },
    ],
  },
  {
    short: "GLUTES",
    title: "Banded lift",
    focus: "GLUTES + BACK",
    time: "45–50 MIN",
    level: "MED–HIGH",
    note: "Place the band above the knees. Push outward into it throughout bridges, kicks, and lateral steps.",
    blocks: [
      {
        title: "WARM UP · 1 ROUND",
        moves: [
          ["5 MIN", "Easy jog or heel-to-butt march"],
          ["20 EA", "Standing stretch + cross-body crunch"],
          ["20", "Slow human saws"],
        ],
      },
      {
        title: "GLUTE · 3 ROUNDS",
        moves: [
          ["20", "Hip-twist jumps"],
          ["15 EA", "Banded donkey kicks"],
          ["20", "Supermans with a two-count hold"],
        ],
      },
      {
        title: "CONTROL · 3 ROUNDS",
        moves: [
          ["30", "Scissor kicks"],
          ["20", "Reverse crunches"],
          ["12", "Pike push-ups with knee tuck"],
        ],
      },
      {
        title: "FINISH · 3 ROUNDS",
        moves: [
          ["15 EA", "Banded side-lying abductions"],
          ["15 EA", "Straight-leg glute lifts"],
          ["30", "Hand-tap planks"],
        ],
      },
    ],
  },
  {
    short: "LINES",
    title: "Long lines",
    focus: "LEGS + POSTURE",
    time: "40–45 MIN",
    level: "MEDIUM",
    note: "Think length before height: reach through the toes, keep your waist lifted, and make every rep deliberate.",
    blocks: [
      {
        title: "WARM UP · 1 ROUND",
        moves: [
          ["5 MIN", "Easy jog or brisk walk"],
          ["20 EA", "Cross-leg pikes"],
          ["10 EA", "World's greatest stretch"],
        ],
      },
      {
        title: "PILATES · 3 ROUNDS",
        moves: [
          ["12 EA", "Side-kneeling leg lifts"],
          ["12 EA", "Side-kneeling rainbows"],
          ["20", "Pilates toe taps"],
        ],
      },
      {
        title: "HAMSTRINGS · 3 ROUNDS",
        moves: [
          ["15", "Towel hamstring slides"],
          ["15", "Banded good mornings"],
          ["20", "Glute bridges with band press-out"],
        ],
      },
      {
        title: "FINISH · 2 ROUNDS",
        moves: [
          ["20 EA", "Inner-thigh circles"],
          ["30", "Plank twists"],
          ["60 SEC", "Half jacks or imaginary jump rope"],
        ],
      },
    ],
  },
  {
    short: "POWER",
    title: "Athletic sculpt",
    focus: "FULL BODY",
    time: "45–55 MIN",
    level: "HIGH",
    note: "This is the week's power day. Land softly, keep the knees tracking over toes, and choose clean reps over speed.",
    blocks: [
      {
        title: "WARM UP · 1 ROUND",
        moves: [
          ["5 MIN", "Easy jog or imaginary jump rope"],
          ["10 EA", "Reverse lunge + knee drive"],
          ["10 EA", "Walkout to shoulder tap"],
        ],
      },
      {
        title: "POWER · 3 ROUNDS",
        moves: [
          ["30", "Hip-twist jumps"],
          ["20", "Tuck crunches"],
          ["20", "Sprinter twists"],
        ],
      },
      {
        title: "UPPER · 3 ROUNDS",
        moves: [
          ["15", "Standing band rows"],
          ["12", "Band overhead presses"],
          ["12", "Close-grip push-ups or knee push-ups"],
        ],
      },
      {
        title: "FINISH · 3 ROUNDS",
        moves: [
          ["20", "Reverse flies with band"],
          ["20", "Crunch flies"],
          ["45 SEC", "Heel-to-butt running in place"],
        ],
      },
    ],
  },
  {
    short: "PILATES",
    title: "Deep core",
    focus: "ABS + MOBILITY",
    time: "30–35 MIN",
    level: "LOW–MED",
    note: "Move slowly enough to feel your deep core switch on. Exhale on effort and keep your lower back heavy.",
    blocks: [
      {
        title: "MOBILITY · 1 ROUND",
        moves: [
          ["60 SEC", "Cat-cow to child's pose"],
          ["8 EA", "Thread-the-needle rotations"],
          ["10", "Slow roll-downs"],
        ],
      },
      {
        title: "CENTER · 3 ROUNDS",
        moves: [
          ["10 EA", "Dead bugs with band pull-apart"],
          ["20", "Tabletop toe taps"],
          ["10 EA", "Single-leg stretch"],
        ],
      },
      {
        title: "SIDE BODY · 2 ROUNDS",
        moves: [
          ["12 EA", "Side plank knee-to-elbow"],
          ["15 EA", "Side-lying inner-thigh lifts"],
          ["10 EA", "Mermaid crunches"],
        ],
      },
      {
        title: "LENGTHEN · 1 ROUND",
        moves: [
          ["45 SEC", "Cobra to child's pose"],
          ["45 SEC", "Figure-four stretch each side"],
          ["60 SEC", "Supine spinal twist"],
        ],
      },
    ],
  },
  {
    short: "BAND",
    title: "Glute endurance",
    focus: "GLUTES + LEGS",
    time: "35–45 MIN",
    level: "MED–HIGH",
    note: "Keep constant band tension. The burn should stay in your glutes—not your lower back or knees.",
    blocks: [
      {
        title: "ACTIVATE · 2 ROUNDS",
        moves: [
          ["20", "Banded bridge press-outs"],
          ["12 EA", "Clamshells"],
          ["10 EA", "Fire hydrant circles"],
        ],
      },
      {
        title: "BUILD · 3 ROUNDS",
        moves: [
          ["15", "Banded squats with three pulses"],
          ["12 EA", "Reverse lunges"],
          ["15 EA", "Standing band abductions"],
        ],
      },
      {
        title: "SHAPE · 3 ROUNDS",
        moves: [
          ["15 EA", "Donkey kick to fire hydrant"],
          ["15 EA", "Straight-leg rainbow taps"],
          ["20", "Frog pumps with band"],
        ],
      },
      {
        title: "FINISH · 2 ROUNDS",
        moves: [
          ["20 EA", "Lateral band walks"],
          ["30 SEC", "Squat hold + band pulses"],
          ["30 SEC", "Glute bridge hold"],
        ],
      },
    ],
  },
  {
    short: "RESET",
    title: "The reset",
    focus: "RECOVERY + WALK",
    time: "25–40 MIN",
    level: "LOW",
    note: "Recovery is training. Keep this easy enough that you finish more energized than you started.",
    blocks: [
      {
        title: "WALK · 1 ROUND",
        moves: [
          ["20–30 MIN", "Easy outdoor walk"],
          ["OPTIONAL", "Five 20-second relaxed strides"],
        ],
      },
      {
        title: "RELEASE · 1 ROUND",
        moves: [
          ["60 SEC", "Hip-flexor stretch each side"],
          ["60 SEC", "Hamstring fold each side"],
          ["60 SEC", "Figure-four stretch each side"],
        ],
      },
      {
        title: "RESTORE · 1 ROUND",
        moves: [
          ["8 EA", "90/90 hip switches"],
          ["8 EA", "Open-book rotations"],
          ["60 SEC", "Legs up the wall"],
        ],
      },
    ],
  },
];

const dayTabs = document.querySelector("#day-tabs");
const dayLabel = document.querySelector("#day-label");
const workoutTitle = document.querySelector("#workout-title");
const workoutStats = document.querySelector("#workout-stats");
const workoutBlocks = document.querySelector("#workout-blocks");
const coachNote = document.querySelector("#coach-note");
const completeButton = document.querySelector("#complete-button");
const completeLabel = document.querySelector("#complete-label");
const progressCount = document.querySelector("#progress-count");
const progressBar = document.querySelector("#progress-bar");
const toast = document.querySelector("#toast");

let activeDay = Math.min(
  Math.max(Number(new URLSearchParams(window.location.search).get("day")) || 1, 1),
  7,
) - 1;

let completedDays = new Set();
try {
  completedDays = new Set(JSON.parse(localStorage.getItem("travel-workout-progress") || "[]"));
} catch {
  completedDays = new Set();
}

function renderTabs() {
  dayTabs.innerHTML = workouts
    .map(
      (workout, index) => `
        <button
          class="day-tab ${completedDays.has(index) ? "is-done" : ""}"
          type="button"
          role="tab"
          aria-selected="${index === activeDay}"
          aria-controls="workout-card"
          data-day="${index}"
        >
          <span>DAY ${String(index + 1).padStart(2, "0")}</span>
          <strong>${workout.short}</strong>
        </button>
      `,
    )
    .join("");

  dayTabs.querySelectorAll(".day-tab").forEach((tab) => {
    tab.addEventListener("click", () => selectDay(Number(tab.dataset.day)));
  });
}

function renderWorkout() {
  const workout = workouts[activeDay];
  dayLabel.textContent = `DAY ${String(activeDay + 1).padStart(2, "0")} / ${workout.focus}`;
  workoutTitle.textContent = workout.title;
  coachNote.textContent = workout.note;

  workoutStats.innerHTML = [
    ["TIME", workout.time],
    ["EQUIPMENT", activeDay === 6 ? "NONE" : "1 BAND"],
    ["EFFORT", workout.level],
  ]
    .map(
      ([label, value]) => `
        <div class="stat">
          <span>${label}</span>
          <strong>${value}</strong>
        </div>
      `,
    )
    .join("");

  workoutBlocks.innerHTML = workout.blocks
    .map(
      (block) => `
        <section class="workout-block">
          <h4 class="block-title">${block.title}</h4>
          <ul class="moves">
            ${block.moves
              .map(
                ([reps, name]) => `
                  <li class="move">
                    <span class="move-reps">${reps}</span>
                    <span class="move-name">${name}</span>
                  </li>
                `,
              )
              .join("")}
          </ul>
        </section>
      `,
    )
    .join("");

  const isComplete = completedDays.has(activeDay);
  completeButton.classList.toggle("is-complete", isComplete);
  completeLabel.textContent = isComplete ? "COMPLETED" : "MARK COMPLETE";

  renderTabs();
  updateProgress();
}

function selectDay(index) {
  activeDay = index;
  const url = new URL(window.location.href);
  url.searchParams.set("day", String(index + 1));
  history.replaceState({}, "", `${url.pathname}${url.search}#routine`);
  renderWorkout();
}

function updateProgress() {
  const total = completedDays.size;
  progressCount.textContent = `${total} / 7`;
  progressBar.style.width = `${(total / 7) * 100}%`;
}

function toggleComplete() {
  if (completedDays.has(activeDay)) {
    completedDays.delete(activeDay);
  } else {
    completedDays.add(activeDay);
  }

  try {
    localStorage.setItem("travel-workout-progress", JSON.stringify([...completedDays]));
  } catch {
    // Progress still works for this session if storage is unavailable.
  }
  renderWorkout();
}

function routineText() {
  const workout = workouts[activeDay];
  const moves = workout.blocks
    .map(
      (block) =>
        `${block.title}\n${block.moves.map(([reps, name]) => `• ${reps} ${name}`).join("\n")}`,
    )
    .join("\n\n");

  return `DAY ${activeDay + 1} — ${workout.title.toUpperCase()}\n${workout.focus} · ${workout.time}\n\n${moves}`;
}

async function shareRoutine() {
  const text = `Day ${activeDay + 1}/7: ${workouts[activeDay].title}. Bodyweight + one band, anywhere.`;
  const url = new URL(window.location.href);
  url.searchParams.set("day", String(activeDay + 1));
  url.hash = "routine";

  if (navigator.share) {
    try {
      await navigator.share({ title: "My Travel Workout", text, url: url.toString() });
      return;
    } catch (error) {
      if (error.name === "AbortError") return;
    }
  }

  try {
    await navigator.clipboard.writeText(`${text}\n${url}`);
    showToast("ROUTINE LINK COPIED");
  } catch {
    showToast("SHARE FROM YOUR BROWSER MENU");
  }
}

function shareOnX() {
  const text = `Day ${activeDay + 1}/7: ${workouts[activeDay].title} — ${workouts[activeDay].focus.toLowerCase()}. Bodyweight + one band, anywhere.`;
  const url = new URL(window.location.href);
  url.searchParams.set("day", String(activeDay + 1));
  url.hash = "routine";
  window.open(
    `https://x.com/intent/post?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
    "_blank",
    "noopener,noreferrer",
  );
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(showToast.timeout);
  showToast.timeout = window.setTimeout(() => toast.classList.remove("is-visible"), 2200);
}

function wrapCanvasText(context, text, maxWidth) {
  const words = text.split(" ");
  const lines = [];
  let line = "";

  words.forEach((word) => {
    const testLine = line ? `${line} ${word}` : word;
    if (context.measureText(testLine).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = testLine;
    }
  });
  if (line) lines.push(line);
  return lines;
}

function downloadDayCard() {
  const workout = workouts[activeDay];
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1350;
  const context = canvas.getContext("2d");

  context.fillStyle = "#f2f0eb";
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.fillStyle = "#151515";
  context.font = "500 25px monospace";
  context.fillText("MY TRAVEL WORKOUT", 72, 80);

  context.fillStyle = "#dc476c";
  context.font = "500 22px monospace";
  context.fillText(`DAY ${String(activeDay + 1).padStart(2, "0")} / ${workout.focus}`, 72, 160);

  context.fillStyle = "#151515";
  context.font = "italic 600 86px Georgia";
  const titleLines = wrapCanvasText(context, workout.title, 850);
  titleLines.forEach((line, index) => context.fillText(line, 72, 260 + index * 90));

  const titleBottom = 260 + titleLines.length * 90;
  context.font = "500 21px monospace";
  context.fillText(`${workout.time}   ·   ${activeDay === 6 ? "NO EQUIPMENT" : "ONE MEDIUM BAND"}`, 72, titleBottom + 15);

  let y = titleBottom + 85;
  workout.blocks.forEach((block, blockIndex) => {
    context.strokeStyle = "rgba(21,21,21,.25)";
    context.beginPath();
    context.moveTo(72, y);
    context.lineTo(1008, y);
    context.stroke();
    y += 38;

    context.fillStyle = "#dc476c";
    context.font = "500 18px monospace";
    context.fillText(`0${blockIndex + 1}`, 72, y);
    context.fillStyle = "#151515";
    context.fillText(block.title, 125, y);
    y += 36;

    block.moves.forEach(([reps, name]) => {
      context.fillStyle = "#151515";
      context.font = "500 18px monospace";
      context.fillText(reps, 125, y);
      context.font = "500 24px Arial";
      const lines = wrapCanvasText(context, name, 665);
      lines.forEach((line, lineIndex) => context.fillText(line, 310, y + lineIndex * 29));
      y += Math.max(40, lines.length * 29 + 9);
    });
    y += 8;
  });

  context.fillStyle = "#d8ff48";
  context.fillRect(0, 1280, 1080, 70);
  context.fillStyle = "#151515";
  context.font = "500 18px monospace";
  context.fillText("STRONG LOOKS GOOD EVERYWHERE.", 72, 1324);
  context.fillText(`${activeDay + 1} / 7`, 940, 1324);

  const link = document.createElement("a");
  link.download = `my-travel-workout-day-${activeDay + 1}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
  showToast("DAY CARD SAVED");
}

completeButton.addEventListener("click", toggleComplete);
document.querySelector("#download-button").addEventListener("click", downloadDayCard);
document.querySelector("#share-button").addEventListener("click", shareOnX);
document.querySelector("#share-top").addEventListener("click", shareRoutine);

document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowRight") selectDay((activeDay + 1) % workouts.length);
  if (event.key === "ArrowLeft") selectDay((activeDay - 1 + workouts.length) % workouts.length);
});

renderWorkout();
