import pandas as pd
from sqlalchemy.orm import Session
from app import models
from scripts.importers.utils import normalizar_colunas, safe_int, safe_str, log_resultado


def importar_laboratorios(caminho_xlsx: str, db: Session):
    """Importa laboratórios da aba 'LABORATÓRIOS'."""
    try:
        df = pd.read_excel(caminho_xlsx, sheet_name="LABORATÓRIOS")
        df = normalizar_colunas(df)
    except Exception as e:
        print(f"[Erro] Falha ao ler Laboratórios: {e}")
        return

    inseridos, erros = 0, []
    for idx, row in df.iterrows():
        try:
            obj = models.Laboratorio(
                nome=safe_str(row["nome"]),
                sigla=safe_str(row.get("sigla")),
                centro_campi=safe_str(row.get("centrocampi")),
                endereco=safe_str(row.get("endereço")),
                responsavel=safe_str(row.get("responsável")),
                email=safe_str(row.get("email")),
                site=safe_str(row.get("site")),
            )
            db.add(obj)
            inseridos += 1
        except Exception as e:
            erros.append({"linha": idx + 2, "erro": str(e)})

    db.commit()
    log_resultado("LABORATÓRIOS", inseridos, erros)


def importar_incubadas(caminho_xlsx: str, db: Session):
    """Importa empresas incubadas da aba 'INBATE'.
    Várias colunas têm baixo preenchimento (cidade, períodos, investimento);
    todos os campos são tratados como opcionais.
    """
    try:
        df = pd.read_excel(caminho_xlsx, sheet_name="INBATE")
        df = normalizar_colunas(df)
    except Exception as e:
        print(f"[Erro] Falha ao ler Empresas Incubadas: {e}")
        return

    inseridos, erros = 0, []
    for idx, row in df.iterrows():
        try:
            obj = models.EmpresaIncubada(
                nome_projeto=str(row["nome_dos_projetos_incubados"]),
                tipo_produto_servico=safe_str(row.get("tipo_de_produtoserviços_desenvolvidos")),
                objetivo=safe_str(row.get("objetivo")),
                equipe_projeto=safe_str(row.get("equipe_do_projeto")),
                departamento_coordenador=safe_str(row.get("departamentos_dos_coordenadores")),
                cidade_estado=safe_str(row.get("cidadeestado")),
                periodo_inicio=safe_str(row.get("período_de_início_de_incubação_do_projeto")),
                periodo_final=safe_str(row.get("período_final_de_incubação_do_projeto")),
                tipo_empresa=safe_str(row.get("tipo_de_empresas")),
                contato=safe_str(row.get("contato")),
                investimento=safe_str(row.get("investimento")),
                incubadora=safe_str(row.get("incubadora")),
                graduada=safe_str(row.get("contagem_de_tipo_de_empresas_para_empresa_graduada")),
            )
            db.add(obj)
            inseridos += 1
        except Exception as e:
            erros.append({"linha": idx + 2, "erro": str(e)})

    db.commit()
    log_resultado("EMPRESAS INCUBADAS", inseridos, erros)


def importar_pos_graduacao(caminho_xlsx: str, db: Session):
    """Importa programas de pós-graduação da aba 'PÓS-GRADUAÇÃO'.
    CODIGO CURSO está vazio na planilha — sempre None.
    CONCEITO CAPES vem da coluna 'conceito_capes_os_que_possuem'.
    """
    try:
        df = pd.read_excel(caminho_xlsx, sheet_name="PÓS-GRADUAÇÃO")
        df = normalizar_colunas(df)
    except Exception as e:
        print(f"[Erro] Falha ao ler Pós-Graduação: {e}")
        return

    inseridos, erros = 0, []
    for idx, row in df.iterrows():
        try:
            obj = models.PosGraduacao(
                id=safe_int(row.get("item")),
                codigo_curso=safe_str(row.get("codigo_curso")),
                programa=str(row["programa"]),
                nome_curso=safe_str(row.get("nome_do_curso")),
                fone=safe_str(row.get("fone")),
                email=safe_str(row.get("email")),
                centro=safe_str(row.get("centro")),
                tipo=safe_str(row.get("tipo")),
                modalidade=safe_str(row.get("modalidade")),
                nivel=safe_str(row.get("nível")),
                conceito_capes=safe_int(row.get("conceito_capes_os_que_possuem")),
            )
            db.add(obj)
            inseridos += 1
        except Exception as e:
            erros.append({"linha": idx + 2, "erro": str(e)})

    db.commit()
    log_resultado("PÓS-GRADUAÇÃO", inseridos, erros)
