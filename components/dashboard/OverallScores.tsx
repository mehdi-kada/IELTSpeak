import Link from "next/link";

interface OverallScoresProps {
  ieltsAverage: number;
  averageFluency: number;
  averageGrammar: number;
  averageVocab: number;
  averagePronunciation: number;
}

export function OverallScores({
  ieltsAverage,
  averageFluency,
  averageGrammar,
  averageVocab,
  averagePronunciation,
}: OverallScoresProps) {
  const getScoreColor = (score: number) => {
    if (score >= 7) return "text-green-600 bg-green-100";
    if (score >= 5.5) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  const getProgressWidth = (score: number) => {
    return Math.min((score / 9) * 100, 100);
  };

  const skills = [
    { name: "Fluency", score: averageFluency, icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32" id="Education">
        <path d="M12 14c-.1 0-.2 0-.3-.1l-11-4C.3 9.8 0 9.4 0 9s.3-.8.7-.9l11-4c.2-.1.5-.1.7 0l11 4c.3.1.6.5.6.9s-.3.8-.7.9l-11 4c-.1.1-.2.1-.3.1zM3.9 9l8.1 2.9L20.1 9 12 6.1 3.9 9z" fill="#e91e63" className="color000000 svgShape"></path>
        <path d="M19 20h-7c-.6 0-1-.4-1-1s.4-1 1-1h6c-.1-2.6-.7-4.8-1.7-6.4-.3-.5-.1-1.1.3-1.4.5-.3 1.1-.1 1.4.3 1.3 2.1 2 5 2 8.4 0 .7-.4 1.1-1 1.1z" fill="#e91e63" className="color000000 svgShape"></path>
        <path d="M12 20H5c-.6 0-1-.4-1-1 0-3.4.7-6.3 2-8.4.3-.5.9-.6 1.4-.3.5.3.6.9.3 1.4-1 1.6-1.6 3.8-1.7 6.4h6c.6 0 1 .4 1 1s-.4.9-1 .9zm10 0c-.6 0-1-.4-1-1V9c0-.6.4-1 1-1s1 .4 1 1v10c0 .6-.4 1-1 1z" fill="#e91e63" className="color000000 svgShape"></path>
      </svg>
    ) },
    { name: "Grammar", score: averageGrammar, icon:  (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 107.5 107.91" width="24" height="24" id="PenPaperDocument">
        <g className="color000000 svgShape">
          <g className="color000000 svgShape">
            <path fill="none" stroke="#E91E63" strokeMiterlimit="10" strokeWidth="5" d="m9.18,86.05c.78,1.04,2.26,1.25,3.31.47.18-.13.34-.29.47-.47l7.08-9.44c.31-.41.47-.91.47-1.42V9.11c0-3.91-3.17-7.08-7.08-7.08h-4.72c-3.91,0-7.08,3.17-7.08,7.08v66.09c0,.51.17,1.01.47,1.42l7.08,9.44Z" className="colorStrokec4a2fc svgStroke"></path>
            <path fill="none" stroke="#E91E63" strokeMiterlimit="10" strokeWidth="5" d="m98.39,2.03h-61.37c-3.91,0-7.08,3.17-7.08,7.08v89.69c0,3.91,3.17,7.08,7.08,7.08h44.84c.63,0,1.23-.25,1.67-.69l21.24-21.24c.44-.44.69-1.04.69-1.67V9.11c0-3.91-3.17-7.08-7.08-7.08h0Z" className="colorStrokec4a2fc svgStroke"></path>
            <path fill="none" stroke="#E91E63" strokeMiterlimit="10" strokeWidth="5" d="M46.47 16.19h21.24M46.47 30.35h42.48M46.47 44.51h42.48M60.63 84.64h-14.16M46.47 63.4h42.48" className="colorc4a2fc svgShape"></path>
            <polygon fill="none" stroke="#E91E63" strokeWidth="5" points="84.23 97.82 84.23 84.64 97.42 84.64 84.23 97.82" className="colorc4a2fc svgShape"></polygon>
          </g>
        </g>
      </svg>
    ) },
    { name: "Vocabulary", score: averageVocab, icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 32 32" width="32" height="32" id="Books">
        <path fill="#e91e63" d="M3.5 23C2.67157 23 2 22.3284 2 21.5V6C2 4.89543 2.89543 4 4 4H15C16.1046 4 17 4.89543 17 6V7H21C22.1046 7 23 7.89543 23 9V11H28C29.1046 11 30 11.8954 30 13V28H16.5C16.2239 28 16 28.2239 16 28.5C16 28.7761 16.2239 29 16.5 29H29.9146C29.7087 29.5826 29.1531 30 28.5 30H16.5C15.6716 30 15 29.3284 15 28.5V26H9.5C8.67157 26 8 25.3284 8 24.5V23H3.5ZM16.9146 22C16.7087 22.5826 16.1531 23 15.5 23H22V9C22 8.44772 21.5523 8 21 8H17V21H3.5C3.22386 21 3 21.2239 3 21.5C3 21.7761 3.22384 22 3.49998 22H16.9146ZM9 23H9.5C9.32468 23 9.15639 23.0301 9 23.0854V23ZM16 20V6C16 5.44772 15.5523 5 15 5H5V20H16ZM16 26V27.0854C16.1564 27.0301 16.3247 27 16.5 27H29V13C29 12.4477 28.5523 12 28 12H23V24H9.5C9.22386 24 9 24.2239 9 24.5C9 24.7761 9.22384 25 9.49998 25H22.9146C22.7087 25.5826 22.1531 26 21.5 26H16Z" className="color212121 svgShape"></path>
      </svg>
    ) },
    { name: "Pronunciation", score: averagePronunciation, icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32" id="Speaking">
        <path fill="none" stroke="#E91E63" strokeWidth="2.5" d="M24.7264 14.6206C25.1706 15.087 25.3854 15.3124 25.4499 15.85 25.4771 16.1039 25.4497 16.3607 25.3694 16.6032 25.2892 16.8456 25.158 17.0681 24.9846 17.2557 24.8113 17.4432 24.5998 17.5915 24.3644 17.6906 24.1291 17.7896 23.8752 17.8372 23.6199 17.83 23.6336 17.9779 23.6483 18.1243 23.6628 18.2693 23.7122 18.761 23.7599 19.2367 23.7599 19.7 23.7627 19.8505 23.7069 19.9962 23.6043 20.1063 23.5016 20.2164 23.3602 20.2822 23.2099 20.29L21.5299 20.35C21.474 20.3839 21.4278 20.4316 21.3958 20.4885 21.3637 20.5454 21.3468 20.6097 21.3468 20.675 21.3468 20.7403 21.3637 20.8046 21.3958 20.8615 21.4278 20.9184 21.474 20.9661 21.5299 21L23.1999 22.07C23.3362 22.1555 23.4423 22.2815 23.5032 22.4304 23.5642 22.5793 23.5771 22.7435 23.5399 22.9 22.9899 24.94 21.5299 26.34 18.2399 26.75 17.6061 26.8237 16.9677 26.8505 16.3299 26.83 16.0766 26.8224 15.8274 26.896 15.6188 27.0399 15.4101 27.1838 15.2529 27.3905 15.1699 27.63L14.4499 29.63H4.44992L6.62992 22.74C6.84732 22.0468 6.78265 21.2958 6.44992 20.65 5.25992 18.37 3.35992 14.43 3.05992 12 2.81076 10.0374 3.35136 8.05625 4.56282 6.49223 5.77428 4.92821 7.55738 3.90945 9.51992 3.66001L14.3299 3.06001C16.2888 2.82225 18.2621 3.36919 19.8191 4.58141 21.3761 5.79363 22.3901 7.57265 22.6399 9.53001L23.0199 12.53C23.7922 13.6399 24.3442 14.2194 24.7264 14.6206ZM30.4699 22.1V20.16C30.4794 20.0936 30.4721 20.0259 30.4485 19.9631 30.425 19.9003 30.386 19.8444 30.3352 19.8006 30.2845 19.7568 30.2235 19.7264 30.1579 19.7123 30.0923 19.6983 30.0242 19.7009 29.9599 19.72L26.7199 20.72C26.6399 20.7463 26.5702 20.7972 26.5208 20.8655 26.4714 20.9337 26.4448 21.0158 26.4448 21.1 26.4448 21.1843 26.4714 21.2664 26.5208 21.3346 26.5702 21.4028 26.6399 21.4537 26.7199 21.48L29.9599 22.48C30.0191 22.497 30.0814 22.5 30.1419 22.4889 30.2024 22.4779 30.2596 22.453 30.3089 22.4162 30.3583 22.3794 30.3985 22.3318 30.4264 22.2769 30.4543 22.2221 30.4692 22.1616 30.4699 22.1ZM27.7199 16 29.0899 17.37C29.1331 17.4139 29.1656 17.4672 29.1849 17.5257 29.2042 17.5842 29.2096 17.6464 29.2009 17.7073 29.1922 17.7683 29.1696 17.8264 29.1347 17.8772 29.0998 17.928 29.0537 17.97 28.9999 18L25.9999 19.6C25.9254 19.6373 25.8411 19.6504 25.7587 19.6375 25.6764 19.6245 25.6002 19.5862 25.5407 19.5278 25.4812 19.4694 25.4415 19.3939 25.427 19.3119 25.4125 19.2298 25.424 19.1452 25.4599 19.07L27.0599 16.07C27.0906 16.0121 27.135 15.9626 27.1893 15.9258 27.2436 15.8891 27.3061 15.8663 27.3713 15.8593 27.4365 15.8524 27.5024 15.8616 27.5631 15.8862 27.6239 15.9107 27.6778 15.9498 27.7199 16ZM29.0899 24.91 27.7199 26.28C27.6778 26.3302 27.6239 26.3693 27.5631 26.3938 27.5024 26.4184 27.4365 26.4276 27.3713 26.4207 27.3061 26.4138 27.2436 26.3909 27.1893 26.3542 27.135 26.3174 27.0906 26.2679 27.0599 26.21L25.4599 23.21C25.424 23.1348 25.4125 23.0502 25.427 22.9682 25.4415 22.8861 25.4812 22.8106 25.5407 22.7522 25.6002 22.6938 25.6764 22.6555 25.7587 22.6426 25.8411 22.6296 25.9254 22.6427 25.9999 22.68L28.9999 24.28C29.0537 24.31 29.0998 24.352 29.1347 24.4028 29.1696 24.4536 29.1922 24.5117 29.2009 24.5727 29.2096 24.6337 29.2042 24.6958 29.1849 24.7543 29.1656 24.8128 29.1331 24.8661 29.0899 24.91Z" className="color212121 svgShape"></path>
      </svg>
    ) },
  ];

  return (
    <div className="bg-[#1F2937] rounded-2xl shadow-xl p-8">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-white">Overall Performance</h2>
        <Link href="/practice">
          <button className="bg-[#E91E63] hover:bg-[#E91E63]/90 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200">
            New Practice
          </button>
        </Link>
      </div>

      {/* IELTS Average Score */}
      <div className="text-center mb-8 p-6 bg-[#E91E63] rounded-xl text-white">
        <h3 className="text-lg font-semibold mb-2">IELTS Average Score</h3>
        <div className="text-5xl font-bold mb-2">{ieltsAverage.toFixed(1)}</div>
        <div className="text-white/80">out of 9.0</div>
      </div>

      {/* Skills Breakdown */}
      <div className="grid md:grid-cols-2 gap-6">
        {skills.map((skill) => (
          <div key={skill.name} className="p-4 border border-gray-700 rounded-lg bg-[#374151]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                {skill.icon}
                <span className="font-semibold text-white">{skill.name}</span>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-bold ${getScoreColor(skill.score)}`}>
                {skill.score.toFixed(1)}
              </span>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-[#E91E63] h-2 rounded-full transition-all duration-300"
                style={{ width: `${getProgressWidth(skill.score)}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
