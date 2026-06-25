-- MySQL dump 10.13  Distrib 8.3.0, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: medly_db
-- ------------------------------------------------------
-- Server version	8.3.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `catalogo_especialidades`
--

DROP TABLE IF EXISTS `catalogo_especialidades`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `catalogo_especialidades` (
  `id_especialidad` int NOT NULL AUTO_INCREMENT,
  `nombre_especialidad` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci,
  `activa` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id_especialidad`),
  UNIQUE KEY `nombre_especialidad` (`nombre_especialidad`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `catalogo_especialidades`
--

LOCK TABLES `catalogo_especialidades` WRITE;
/*!40000 ALTER TABLE `catalogo_especialidades` DISABLE KEYS */;
INSERT INTO `catalogo_especialidades` VALUES (1,'PEDIATRÍA','Cuidado médico de bebés, niños y adolescentes.',1),(2,'CARDIOLOGÍA','Estudio, diagnóstico y tratamiento de enfermedades del corazón.',1),(3,'GINECOLOGÍA Y OBSTETRICIA','Atención a la salud del sistema reproductor femenino y embarazos.',1),(4,'DERMATOLOGÍA','Diagnóstico y tratamiento de enfermedades de la piel.',1),(5,'OFTALMOLOGÍA','Cuidado y salud ocular, incluyendo cirugías.',1),(6,'NEUROLOGÍA','Diagnóstico y tratamiento de enfermedades del sistema nervioso.',1);
/*!40000 ALTER TABLE `catalogo_especialidades` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `citas`
--

DROP TABLE IF EXISTS `citas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `citas` (
  `id_cita` int NOT NULL AUTO_INCREMENT,
  `id_paciente` int NOT NULL,
  `id_doctor` int NOT NULL,
  `fecha` date NOT NULL,
  `hora` time NOT NULL,
  `estado` enum('programada','completada','cancelada') COLLATE utf8mb4_unicode_ci DEFAULT 'programada',
  `creado_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_cita`),
  KEY `fk_cita_paciente` (`id_paciente`),
  KEY `idx_fecha_hora` (`fecha`,`hora`),
  KEY `fk_cita_doctor` (`id_doctor`),
  CONSTRAINT `fk_cita_doctor` FOREIGN KEY (`id_doctor`) REFERENCES `doctores` (`id_doctor`) ON DELETE RESTRICT,
  CONSTRAINT `fk_cita_paciente` FOREIGN KEY (`id_paciente`) REFERENCES `pacientes` (`id_paciente`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `citas`
--

LOCK TABLES `citas` WRITE;
/*!40000 ALTER TABLE `citas` DISABLE KEYS */;
INSERT INTO `citas` VALUES (2,7,2,'2026-06-15','08:00:00','programada','2026-06-14 17:19:44'),(3,6,2,'2026-06-15','09:00:00','programada','2026-06-14 17:34:21'),(4,6,2,'2026-06-15','10:00:00','programada','2026-06-14 17:42:28'),(5,5,2,'2026-06-15','11:00:00','programada','2026-06-14 17:49:59'),(6,5,2,'2026-06-15','12:00:00','programada','2026-06-14 17:52:10'),(7,2,2,'2026-06-15','13:00:00','programada','2026-06-14 18:03:53'),(8,2,3,'2026-06-15','08:00:00','programada','2026-06-14 19:14:49'),(9,2,2,'2026-06-16','08:00:00','programada','2026-06-15 21:25:43'),(10,10,1,'2026-06-16','08:00:00','programada','2026-06-15 21:35:32'),(11,10,1,'2026-06-19','08:00:00','programada','2026-06-18 20:40:19');
/*!40000 ALTER TABLE `citas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `consultas`
--

DROP TABLE IF EXISTS `consultas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `consultas` (
  `id_consulta` int NOT NULL AUTO_INCREMENT,
  `id_cita` int NOT NULL,
  `peso` decimal(5,2) DEFAULT NULL COMMENT 'En kilogramos',
  `talla` decimal(4,2) DEFAULT NULL COMMENT 'En metros',
  `temperatura` decimal(4,1) DEFAULT NULL COMMENT 'En grados Celsius',
  `presion_arterial` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Ej. 120/80',
  `frecuencia_cardiaca` int DEFAULT NULL COMMENT 'Latidos por minuto',
  `frecuencia_respiratoria` int DEFAULT NULL COMMENT 'Respiraciones por minuto',
  `saturacion_oxigeno` int DEFAULT NULL COMMENT 'Porcentaje',
  `motivo_consulta` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `exploracion_fisica` text COLLATE utf8mb4_unicode_ci,
  `diagnostico` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `notas_adicionales` text COLLATE utf8mb4_unicode_ci,
  `fecha_registro` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_consulta`),
  UNIQUE KEY `id_cita` (`id_cita`),
  CONSTRAINT `consultas_ibfk_1` FOREIGN KEY (`id_cita`) REFERENCES `citas` (`id_cita`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `consultas`
--

LOCK TABLES `consultas` WRITE;
/*!40000 ALTER TABLE `consultas` DISABLE KEYS */;
/*!40000 ALTER TABLE `consultas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `detalles_receta`
--

DROP TABLE IF EXISTS `detalles_receta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `detalles_receta` (
  `id_detalle` int NOT NULL AUTO_INCREMENT,
  `id_receta` int NOT NULL,
  `medicamento` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `dosis` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `frecuencia` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Ej. Cada 8 horas',
  `duracion` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Ej. Por 5 días',
  `notas_medicamento` text COLLATE utf8mb4_unicode_ci,
  `surtido` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id_detalle`),
  KEY `id_receta` (`id_receta`),
  CONSTRAINT `detalles_receta_ibfk_1` FOREIGN KEY (`id_receta`) REFERENCES `recetas` (`id_receta`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `detalles_receta`
--

LOCK TABLES `detalles_receta` WRITE;
/*!40000 ALTER TABLE `detalles_receta` DISABLE KEYS */;
/*!40000 ALTER TABLE `detalles_receta` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `doctores`
--

DROP TABLE IF EXISTS `doctores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `doctores` (
  `id_doctor` int NOT NULL AUTO_INCREMENT,
  `id_usuario` int NOT NULL,
  `id_doctor_visible` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nombres` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `apellido_paterno` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `apellido_materno` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fecha_nacimiento` date NOT NULL,
  `sexo` varchar(15) COLLATE utf8mb4_unicode_ci NOT NULL,
  `curp` char(18) COLLATE utf8mb4_unicode_ci NOT NULL,
  `telefono` varchar(15) COLLATE utf8mb4_unicode_ci NOT NULL,
  `correo_personal` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `cedula` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `calle` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `colonia` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `codigo_postal` char(5) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ciudad` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `estado` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id_doctor`),
  UNIQUE KEY `curp` (`curp`),
  UNIQUE KEY `correo_institucional` (`correo_personal`),
  UNIQUE KEY `cedula` (`cedula`),
  UNIQUE KEY `id_doctor_visible` (`id_doctor_visible`),
  KEY `id_usuario` (`id_usuario`),
  CONSTRAINT `doctores_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `doctores`
--

LOCK TABLES `doctores` WRITE;
/*!40000 ALTER TABLE `doctores` DISABLE KEYS */;
INSERT INTO `doctores` VALUES (1,11,'DOC-00001','ARIAN EDUARDO','GONZALEZ','GONZALEZ','2004-08-26','MASCULINO','GOGA040826HDFNNRA9','5544753881','ary.eddgg@gmail.com','12345678','CALANDRIA','BENITO JUAREZ','57000','NEZAHUALCOYOTL','ESTADO DE MÉXICO'),(2,12,'DOC-00002','ARIANNA ','MORALES','GUERRERO','2004-10-14','FEMENINO','MOGA041014MDFRRRA0','5572193753','ariannagueraldes@gmail.com','20246502','PARAMARIBO 23','SAN PEDRO ZACATENCO','07360','GUSTAVO A. MADERO','CIUDAD DE MÉXICO'),(3,18,'DOC-00003','CARLOS ALBERTO','HERNANDEZ','LOPEZ','1987-08-15','MASCULINO','HELC870815HDFRPR08','5544753881','maredgo@gmail.com','8457123','AV. INSURGENTES SUR 1254','DEL VALLE CENTRO','03100','BENITO JUAREZ','CIUDAD DE MEXICO'),(4,19,'DOC-00004','DANIEL','LOPEZ','DOMINGUEZ','2000-12-27','MASCULINO','LODD991227HMCPMN05','5512345678','danikrkic@gmail.com','123456788','MARAVATIO 12','BARRIO VIEJO','00001','ECATEPEC','ESTADO DE MÉXICO');
/*!40000 ALTER TABLE `doctores` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `doctores_especialidades`
--

DROP TABLE IF EXISTS `doctores_especialidades`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `doctores_especialidades` (
  `id_relacion` int NOT NULL AUTO_INCREMENT,
  `id_doctor` int NOT NULL,
  `id_especialidad` int NOT NULL,
  `cedula_especialidad` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fecha_registro` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_relacion`),
  UNIQUE KEY `id_doctor` (`id_doctor`,`id_especialidad`),
  KEY `id_especialidad` (`id_especialidad`),
  CONSTRAINT `doctores_especialidades_ibfk_1` FOREIGN KEY (`id_doctor`) REFERENCES `doctores` (`id_doctor`) ON DELETE CASCADE,
  CONSTRAINT `doctores_especialidades_ibfk_2` FOREIGN KEY (`id_especialidad`) REFERENCES `catalogo_especialidades` (`id_especialidad`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `doctores_especialidades`
--

LOCK TABLES `doctores_especialidades` WRITE;
/*!40000 ALTER TABLE `doctores_especialidades` DISABLE KEYS */;
INSERT INTO `doctores_especialidades` VALUES (1,2,6,'20246300','2026-06-08 05:01:54'),(2,2,4,'87654321','2026-06-08 05:05:54');
/*!40000 ALTER TABLE `doctores_especialidades` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `expedientes_clinicos`
--

DROP TABLE IF EXISTS `expedientes_clinicos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `expedientes_clinicos` (
  `id_expediente` int NOT NULL AUTO_INCREMENT,
  `id_paciente` int NOT NULL,
  `tipo_sangre` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT 'No reg.',
  `alergias` text COLLATE utf8mb4_unicode_ci,
  `antecedentes_heredofamiliares` text COLLATE utf8mb4_unicode_ci,
  `enfermedades_cronicas` text COLLATE utf8mb4_unicode_ci,
  `antecedentes_quirurgicos` text COLLATE utf8mb4_unicode_ci,
  `habitos_toxicomania` text COLLATE utf8mb4_unicode_ci,
  `fecha_actualizacion` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_expediente`),
  UNIQUE KEY `id_paciente` (`id_paciente`),
  CONSTRAINT `expedientes_clinicos_ibfk_1` FOREIGN KEY (`id_paciente`) REFERENCES `pacientes` (`id_paciente`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `expedientes_clinicos`
--

LOCK TABLES `expedientes_clinicos` WRITE;
/*!40000 ALTER TABLE `expedientes_clinicos` DISABLE KEYS */;
INSERT INTO `expedientes_clinicos` VALUES (1,10,'A-','Penicilina','Cancer','Diabetes Mellitus Tipo 1','Rodilla','Tabaquismo Activo','2026-06-18 22:52:06');
/*!40000 ALTER TABLE `expedientes_clinicos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `horarios_doctores`
--

DROP TABLE IF EXISTS `horarios_doctores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `horarios_doctores` (
  `id_horario` int NOT NULL AUTO_INCREMENT,
  `id_doctor` int NOT NULL,
  `dia_semana` tinyint NOT NULL COMMENT '0=Domingo, 1=Lunes, 2=Martes, 3=Miércoles, 4=Jueves, 5=Viernes, 6=Sábado',
  `hora_inicio` time NOT NULL,
  `hora_fin` time NOT NULL,
  PRIMARY KEY (`id_horario`),
  UNIQUE KEY `id_doctor` (`id_doctor`,`dia_semana`),
  CONSTRAINT `horarios_doctores_ibfk_1` FOREIGN KEY (`id_doctor`) REFERENCES `doctores` (`id_doctor`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `horarios_doctores`
--

LOCK TABLES `horarios_doctores` WRITE;
/*!40000 ALTER TABLE `horarios_doctores` DISABLE KEYS */;
INSERT INTO `horarios_doctores` VALUES (1,2,1,'08:00:00','16:00:00'),(2,2,2,'08:00:00','16:00:00'),(3,2,3,'08:00:00','16:00:00'),(4,2,4,'08:00:00','16:00:00'),(5,1,2,'08:00:00','16:00:00'),(6,1,3,'08:00:00','16:00:00'),(7,1,4,'08:00:00','16:00:00'),(8,1,5,'08:00:00','16:00:00'),(9,3,1,'08:00:00','16:00:00'),(10,3,2,'08:00:00','16:00:00'),(11,3,5,'08:00:00','16:00:00'),(12,3,6,'08:00:00','14:00:00');
/*!40000 ALTER TABLE `horarios_doctores` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pacientes`
--

DROP TABLE IF EXISTS `pacientes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pacientes` (
  `id_paciente` int NOT NULL AUTO_INCREMENT,
  `id_usuario` int NOT NULL,
  `id_paciente_visible` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nombres` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `apellido_paterno` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `apellido_materno` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fecha_nacimiento` date NOT NULL,
  `sexo` varchar(15) COLLATE utf8mb4_unicode_ci NOT NULL,
  `curp` char(18) COLLATE utf8mb4_unicode_ci NOT NULL,
  `telefono` varchar(15) COLLATE utf8mb4_unicode_ci NOT NULL,
  `calle` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `colonia` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `codigo_postal` char(5) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ciudad` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `estado` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id_paciente`),
  UNIQUE KEY `curp` (`curp`),
  UNIQUE KEY `id_paciente_visible` (`id_paciente_visible`),
  KEY `id_usuario` (`id_usuario`),
  CONSTRAINT `pacientes_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pacientes`
--

LOCK TABLES `pacientes` WRITE;
/*!40000 ALTER TABLE `pacientes` DISABLE KEYS */;
INSERT INTO `pacientes` VALUES (2,3,'PAC-00002','ARIAN EDUARDO','GONZALEZ','GONZALEZ','2004-08-26','MASCULINO','GOGA040826HDFNNRA9','5544753881','CALANDRIA','BENITO JUAREZ','57000','NEZAHUALCOYOTL','ESTADO DE MÉXICO'),(5,9,'PAC-00005','ARIAN EDUARDO','GONZALEZ','GONZALEZ','2004-08-26','MASCULINO','GOGA040826HDFNNRA8','5544753881','CALANDRIA','BENITO JUAREZ','57000','NEZAHUALCOYOTL','ESTADO DE MÉXICO'),(6,10,'PAC-00006','ANDRIK YAEL','PAEZ','GOMEZ','2003-03-08','MASCULINO','PAGA030308HMCZMNA3','5614318200','AV TEPOZANEZ','ESPERANZA','57800','NEZAHUALCOYOTL','ESTADO DE MÉXICO'),(7,13,'PAC-00007','CARLOS','SEGUNDO','CHAVEZ','2000-01-12','MASCULINO','SECC000112HDFXXXX0','5614318200','AV TEPOZANEZ','ESPERANZA','57800','NEZAHUALCOYOTL','ESTADO DE MÉXICO'),(10,20,'PAC-00010','DANIEL','LOPEZ','DOMINGUEZ','1987-08-15','MASCULINO','GOGA040826HDFNNRA6','5544753881','AV. INSURGENTES SUR 1254','DEL VALLE CENTRO','57000','BENITO JUAREZ','CIUDAD DE MEXICO');
/*!40000 ALTER TABLE `pacientes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `recetas`
--

DROP TABLE IF EXISTS `recetas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `recetas` (
  `id_receta` int NOT NULL AUTO_INCREMENT,
  `id_consulta` int NOT NULL,
  `folio_receta` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `indicaciones_generales` text COLLATE utf8mb4_unicode_ci COMMENT 'Recomendaciones de dieta, reposo, etc.',
  `estado` enum('emitida','surtida_parcial','surtida_completa','cancelada') COLLATE utf8mb4_unicode_ci DEFAULT 'emitida',
  `fecha_emision` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_receta`),
  UNIQUE KEY `id_consulta` (`id_consulta`),
  UNIQUE KEY `folio_receta` (`folio_receta`),
  CONSTRAINT `recetas_ibfk_1` FOREIGN KEY (`id_consulta`) REFERENCES `consultas` (`id_consulta`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `recetas`
--

LOCK TABLES `recetas` WRITE;
/*!40000 ALTER TABLE `recetas` DISABLE KEYS */;
/*!40000 ALTER TABLE `recetas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `id_usuario` int NOT NULL AUTO_INCREMENT,
  `correo` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `contrasena` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `rol` tinyint NOT NULL,
  `activo` tinyint(1) DEFAULT '1',
  `verificado` tinyint(1) DEFAULT '0',
  `codigo_verificacion` varchar(6) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `debe_cambiar_password` tinyint(1) DEFAULT '0',
  `codigo_expira` datetime DEFAULT NULL,
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `correo` (`correo`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (1,'admin@medly.com','$2b$10$H90I7FoDiSKSlNn/msIAauzgZ8YadiY2U36pXxFNz//eYAzAo0Bfa',1,1,0,NULL,'2026-06-02 23:15:56',0,NULL),(3,'axeleduardofdd@gmail.com','$2b$10$yFkrYmbW0Zukl6rqkPH6re1VLl4oZfrUBOpPJd0IagRsUVC.2hWNy',3,1,1,NULL,'2026-06-03 05:50:15',0,NULL),(7,'ary.eddgg@gmail.com','$2b$10$upBh.msXyF5emY.iqZpMHOtQrhHdMG2hCAxfZGhmt3fFg5kXO1JJa',1,1,1,NULL,'2026-06-04 19:25:16',0,NULL),(8,'ariannagueraldes@gmail.com','$2b$10$hnEvjIHijB9NOeJD2..pAeR2n5hVDtcaME2zEgdld/8iuzHvU78.u',3,1,1,NULL,'2026-06-04 20:18:10',0,NULL),(9,'gonzalez.gonzalez.arian@gmail.com','$2b$10$tUp2SjgQYxbMxLCgUnTv4OGO40mj.MUfTqoIS8SzGl2fH2scMTLGa',3,1,1,NULL,'2026-06-04 20:26:24',0,NULL),(10,'andrik.yaelpg@gmail.com','$2b$10$ObC/kcaPbwA2I7NuLtfM1uAKoP0XtzGQCjhFAgXdRFuohzYE8ryUS',3,1,1,NULL,'2026-06-04 21:55:42',0,NULL),(11,'dr.arian.gonzalez@medly.com','$2b$10$IGUo3GwAHsz9yLnyMiIkBuxMp4dfKhQyV2iDJGjMZ13SZCFVLeS/K',2,1,1,NULL,'2026-06-08 03:30:48',0,NULL),(12,'dra.arianna.morales@medly.com','$2b$10$B/2Tie51l8Xm4yEbqq74/u4t4aeqg8u/nTLZMezOMJWxPRn4cKYBe',2,1,1,NULL,'2026-06-08 05:01:54',0,NULL),(13,'edddieglez26@gmail.com','$2b$10$x7/kTJ0jOWecL9BSowA/vuKmT43k86uEzZy9V7uBrWP.6bXIscFji',3,1,1,NULL,'2026-06-08 16:00:58',0,NULL),(18,'dr.carlos.hernandez@medly.com','$2b$10$BbkZbeJ02arXcfkFWINi2u3YdirmjMmte.lyaRn.mFQUtR7W7u0oW',2,1,1,NULL,'2026-06-14 19:03:02',0,NULL),(19,'dr.daniel.lopez@medly.com','$2b$10$c4d/4p6hZFt.m2qLwQbwi.VMf7EM/XlPsVaZrvKYGKYqxDCHcVW3W',2,1,1,NULL,'2026-06-15 21:30:48',0,NULL),(20,'danikrkic@gmail.com','$2b$10$eNu3GydhQBNC0YH4yZ55seuuqOcGmtP9U7kkTW9tqztqW.dD7rpC2',3,1,1,NULL,'2026-06-15 21:33:00',0,NULL);
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-06-24 18:20:24
