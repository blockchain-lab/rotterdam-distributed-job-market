library(shiny)
library(shinydashboard)
library(googleVis)
library(dplyr)
library(readr)

ui <- dashboardPage(skin = "green",
                    
                    dashboardHeader(title = 'Trucker UI', titleWidth = 250),
                    
                    dashboardSidebar(width = 250,
                                     sidebarMenu(
                                       menuItem("View requests", tabName = "viewRequests", icon = icon("home")),
                                       menuItem("Track bids", tabName = "trackBids", icon = icon("free-code-camp")),
                                       menuItem("Track contracts", tabName = "trackContracts", icon = icon("area-chart")),
                                       menuItem("My Profile", tabName = "profile", icon = icon("address-card-o"))
                                     )
                    ),
                    
                    dashboardBody(
                      tabItems(
                        tabItem(tabName = "viewRequests",
                                p("")
                        ),
                        
                        tabItem(tabName = "trackBids",
                                p("")
                        ),
                        tabItem(tabName = "trackContracts",
                                p("")
                        ),
                        tabItem(tabName = "profile",
                                p("")
                        )
                      )
                    )
)

server <- function(input, output) {
  
}

# Run the application 
shinyApp(ui = ui, server = server)

