$(function () {
    $("#tab_nav li").click(function () {
        console.log("type:" + $(this).text())
        location.href = "?topic=" + $(this).text()
    })

    $(".pagination.pull-right").children().click(function () {
        if ($(this).hasClass("disabled")) {
            return;
        }
        var curPage = $("#curpage").text();
        console.log("curPage:" + curPage)
        var next = 0;
        if ($(this).text() == "下一页") {
            next = parseInt(curPage) + 1;
        } else {
            next = parseInt(curPage) - 1;
        }

        console.log("next:" + next)
        location.href = "?topic=" + $("#tab_nav li.active").text() + "&page=" + next;
    })
    getHotArticles();
    getHostSites();
})


function getHostSites() {
    $.ajax({
            type: "get",
            url: "/topics/hot",
            success: function (data) {
                if (data.status == '200') {
                    var html = ""
                    for (var index = 0; index < data.data.length; index++) {
                        var entity = data.data[index];
                        html += ' <dl> '
                            + ' <dd class="pull-left">'
                            + '  <p class="clearfix">'
                            + '   <span class="topic-tag">'
                            + '    <a href="/?topic='+entity.name+'" class="aw-user-name" data-id="'+entity.name+'">'+entity.name+'</a>'
                            + '   </span>'
                            + '  </p>'
                            + ' <p><b>'+entity.articleCount+'</b> 篇文章 • <b>'+entity.followerCount+'</b> 人订阅 </p>'
                            + ' </dd>'
                            + ' </dl>'
                    }
                    $("#hotype").append(html)
                } else {
                    $("#hotype").text("暂时不能获取热门"+type);
                }
            },
            error: function (err) {
                $("#hotype").text("暂时不能获取热门"+type);
            },
            dataType: 'json',
        }
    )
}

function getHotArticles() {
    $.ajax({
            type: "POST",
            url: "/articles/hot",
            success: function (data) {
                if (data.status == '200') {

                    var html = ""
                    for (var index = 0; index < data.data.length; index++) {
                        var article = data.data[index];
                        html += ' <dl> '
                            + ' <dd class="pull-left">'
                            + '  <p class="clearfix">'
                            + '   <span class="topic-tag">'
                            + '    <a href="/articles/'+article._id+'" class="text" data-id="'+article._id+'">'+article.title+'</a>'
                            + '   </span>'
                            + '  </p>'
                            + ' <p><b>'+article.readCount+'</b> 次浏览 • <b>'+article.collectCount+'</b> 人收藏 </p>'
                            + ' </dd>'
                            + ' </dl>'
                    }
                    $("#hotarticle").append(html)
                } else {
                    $("#hotarticle").text("暂时不能获取热门文章");
                }
            },
            error: function () {
                $("#hotarticle").text("暂时不能获取热门文章");
            },
            dataType: 'json',
        }
    )
}