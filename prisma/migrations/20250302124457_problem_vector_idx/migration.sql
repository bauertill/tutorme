-- https://github.com/prisma/prisma/issues/23326#issuecomment-2517134325

CREATE INDEX "Problem_vector_hnsw_idx" ON "Problem" USING hnsw ((vector::halfvec(3072)) halfvec_cosine_ops);
