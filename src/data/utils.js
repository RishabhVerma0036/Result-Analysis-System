export const getGrade = (marks) => {
  if (marks >= 90) return { grade: 'O', points: 10, status: 'Pass' };
  if (marks >= 80) return { grade: 'A+', points: 9, status: 'Pass' };
  if (marks >= 70) return { grade: 'A', points: 8, status: 'Pass' };
  if (marks >= 60) return { grade: 'B+', points: 7, status: 'Pass' };
  if (marks >= 50) return { grade: 'B', points: 6, status: 'Pass' };
  if (marks >= 40) return { grade: 'C', points: 5, status: 'Pass' };
  return { grade: 'F', points: 0, status: 'Fail' };
};

export const recalculateStudentStats = (student) => {
  const newStudent = JSON.parse(JSON.stringify(student));
  let totalSgpa = 0;
  let validSems = 0;

  newStudent.semesters.forEach(sem => {
    let totalMarks = 0;
    let maxMarks = 0;

    Object.values(sem.subjects).forEach(data => {
      totalMarks += (Number(data.ext) || 0) + (Number(data.int) || 0);
      maxMarks += 100;
    });

    sem.sgpa = maxMarks ? (totalMarks / maxMarks) * 10 : 0;
    if (maxMarks) validSems++;
    totalSgpa += sem.sgpa;
  });

  newStudent.cgpa = validSems ? totalSgpa / validSems : 0;
  return newStudent;
};