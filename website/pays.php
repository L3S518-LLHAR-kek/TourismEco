<?php require_once 'head.php'?>


<body>
    <div class="container-map">
        <div id="map"></div>
    </div>

    <div class="grille" id="grille" hx-swap="outerHTML swap:2s">

        <div class="sidebar">
            <div id="mini0"></div>

            <div class="container-side bg-52796F" hx-get="catalogue.php" hx-select="#catalogue" hx-target="#catalogue" hx-trigger="click" hx-swap="show:top" hx-vals="js:{page:'Pays'}">
                <div class="bandeau-small"> 
                    <img id=plus class="flag-small" src='assets/img/plus.svg'>
                    <h2 class="nom-small">Choisir des pays</h2>
                </div>

            </div>
        </div>

        <div class="main" id="main">

            <?php
                $cur = getDB();

                $pays = "";
                if (isset($_SESSION["pays"]) && count($_SESSION["pays"]) != 0) {
                    $query = "SELECT * FROM pays WHERE id = :id_pays";
                    $sth = $cur->prepare($query);
                    $sth->bindParam(":id_pays", $_SESSION["pays"][0], PDO::PARAM_STR);
                    $sth->execute();

                    $ligne = $sth->fetch();
                    if ($ligne) {
                        $pays = $_SESSION["pays"][0];
                    }
                } else {
                    $_SESSION["pays"] = array();
                }

                if ($pays == "") {
                    echo <<<HTML
                        <div hx-get="catalogue.php" hx-trigger="load" hx-select="#catalogue" hx-target="#catalogue" hx-vals="js:{page:'Pays'}"></div>
                    HTML;
                } else {
                    echo <<<HTML
                        <div hx-get="scripts/htmx/getPays.php" hx-vals="js:{id_pays:'$pays'}" hx-trigger="load delay:1s"></div>
                    HTML;
                }
            ?>

            <div id="catalogue"></div>

            <div class="container-bandeaux">
                <div id="bandeau0"></div>
            </div>

            <div class="container-simple bg-52796F">
                <h2 class="title-section">Description</h2>
                <div id="descip"></div>
            </div>

            <div class="container-simple bg-52796F">
                <h2 class="title-section">Indicateurs clés</h2>
                <div class="container-even" id="indicateurs"></div>
            </div>

            <div class="container-simple bg-52796F">

                <div class="score-jauge-container">
                    <div class="score-container">
                        <div id="score"></div>
                        <h2>Score EcoTourism</h2>
                        <p >
                            Le Lorem Ipsum est simplement du faux texte employéLe Lorem Ipsum est simplement du faux texte employé Lorem Ipsum .</p>
                    </div>
                    <div class="jauge-container">
                        <div class="graph" id="jauge"></div>
                        <p >Coût du séjour</p>
                    </div>
                    <div class="jauge-container">
                        <div class="graph" id="jauge2"></div>
                        <p >Impact écologique</p>
                    </div>
                </div>
            </div>

          


            <div class="container-simple bg-354F52">
                <h2 class="title-section">Evolution du Co2 en France dans le temps</h2>
                <div class="section">
                    <div class="graph" id="chartdiv2"></div>

                    <div class="text">
                        <p>Le Lorem Ipsum est simplement du faux texte employé dans la composition et la mise en page avant impression. Le Lorem Ipsum est le faux texte standard de l'imprimerie depuis les années 1500, quand un imprimeur anonyme assembla ensemble des morceaux de texte pour réaliser un livre spécimen de polices de texte. Il n'a pas fait que survivre cinq siècles, mais s'est aussi adapté à la bureautique informatique, sans que son contenu n'en soit modifié. Il a été popularisé dans les années 1960 grâce à la vente de feuilles Letraset contenant des passages du Lorem Ipsum, et, plus récemment, par son inclusion dans des applications de mise en page de texte, comme Aldus PageMaker.
                            </p>
                    </div>
                </div>
            </div>

            <div class="container-simple bg-354F52">
                <h2 class="title-section">Evolution du PIB par rapport au tourisme</h2>
                <div class="section">
                    <div class="text">
                        <p>Le Lorem Ipsum est simplement du faux texte employé dans la composition et la mise en page avant impression. Le Lorem Ipsum est le faux texte standard de l'imprimerie depuis les années 1500, quand un imprimeur anonyme assembla ensemble des morceaux de texte pour réaliser un livre spécimen de polices de texte. Il n'a pas fait que survivre cinq siècles, mais s'est aussi adapté à la bureautique informatique, sans que son contenu n'en soit modifié. Il a été popularisé dans les années 1960 grâce à la vente de feuilles Letraset contenant des passages du Lorem Ipsum, et, plus récemment, par son inclusion dans des applications de mise en page de texte, comme Aldus PageMaker.
                       </p>
                    </div>
                    
                    <div class="graph" id="barreLine"></div>
                </div>
            </div>
            

            <div class="container-simple bg-354F52">
                <h2 class="title-section">Evolution du PIB de la France dans le temps</h2>
                <div class="section">
                    <div class="graph" id="spider"></div>
                </div>
            </div>


            <div class="container-simple bg-52796F">
                <h2 class="title-section">Comparateur rapide</h2>
                <p>
                    Voici quelques pays pertinents que vous pouvez comparer avec la France
                </p>

               <div class="graph" id="top"></div>

            </div>

            <script id=scripting>
                
                barreLine("barreLine")
                spider("spider")
                createLine("chartdiv2")
                createMap()

                addJauge("jauge")
                addJauge("jauge2")

            </script>

        </div>
    </div>

    
            
    <?php require_once 'footer.html'?>
</body>
