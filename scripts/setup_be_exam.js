import fs from "node:fs";
import path from "node:path";

const repoPath = path.resolve(
  "../Englow3_BE/src/main/java/com/englow3/exam/repository/ExamRepository.java",
);
let repoContent = fs.readFileSync(repoPath, "utf-8");

if (!repoContent.includes("searchCatalogue")) {
  // Normalize \r\n to \n for replacement, then keep clean
  const insertionPoint = "Page<Exam> search(";
  const index = repoContent.indexOf(insertionPoint);
  if (index !== -1) {
    const semiIndex = repoContent.indexOf(";", index);
    const before = repoContent.slice(0, semiIndex + 1);
    const after = repoContent.slice(semiIndex + 1);

    const addition = `

    @Query("""
            select e from Exam e
            where (:status is null or e.status = :status)
              and (:examType is null or e.examType = :examType)
              and (:certificateType is null or e.certificateType = :certificateType)
              and (:certificateVariant is null or e.certificateVariant = :certificateVariant)
              and (:targetLevel is null or e.targetLevel = :targetLevel)
              and (:title is null or lower(e.title) like lower(concat('%', cast(:title as String), '%')))
            """)
    Page<Exam> searchCatalogue(
            @Param("status") ExamStatus status,
            @Param("examType") ExamType examType,
            @Param("certificateType") com.englow3.exam.entity.CertificateType certificateType,
            @Param("certificateVariant") com.englow3.exam.entity.CertificateVariant certificateVariant,
            @Param("targetLevel") com.englow3.exam.entity.TargetLevel targetLevel,
            @Param("title") String title,
            Pageable pageable);`;

    repoContent = before + addition + after;
    fs.writeFileSync(repoPath, repoContent, "utf-8");
    console.log(
      "ExamRepository.java successfully updated with searchCatalogue!",
    );
  } else {
    console.error("Could not find insertion point in ExamRepository.java");
  }
} else {
  console.log("ExamRepository.java already contains searchCatalogue");
}
