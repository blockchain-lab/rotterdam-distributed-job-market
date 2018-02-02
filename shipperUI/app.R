library(shiny)
library(shinydashboard)
library(dplyr)
library(readr)
library(jsonlite)
library(DT)
library(httr)

default_shipper_id = 1
default_rest_addr = "http://761f99c2.eu.ngrok.io/"

#---------------------------- API Names for shipper------------------------

api_initialization = "test/initnetwork"
api_shipper_profile = "containerGuy"

api_create_job_offer = "createContainerDeliveryJobOffer"
api_create_container_info = "createContainerInfo"

api_job_offers_history = "allContainerDeliveryJobOffersOf"
api_container_history = "allContainersOf" #-------------

path_job_offers = "ContainerDeliveryJobOffer"
api_get_bids = "getTruckerBids"
api_get_rating = "trucker/rating"
api_accept_bid = "acceptBid"

path_contracts = "ContainerDeliveryJob"
api_contract_list = "contractedJobs"
api_accept_delivery = "acceptDelivery"
api_raise_exception = "raiseException"


##======================================Layout=============================================

ui <- dashboardPage(skin = "green",
                    
                    dashboardHeader(title = 'Shipper UI', titleWidth = 250),
                    
                    dashboardSidebar(width = 250,
                                     sidebarMenu(id="mainmenu",
                                                 menuItem("Create & view requests", tabName = "requestTruck", 
                                                          icon = icon("home")),
                                                 menuItem("View & accept bids", tabName = "viewBids", 
                                                          icon = icon("free-code-camp")),
                                                 menuItem("Track & update contracts", tabName = "viewContracts", 
                                                          icon = icon("area-chart")),
                                                 menuItem("My Profile", tabName = "profile", 
                                                          icon = icon("address-card-o"))
                                     )
                    ),
                    
                    dashboardBody(
                      tabItems(
                        tabItem(tabName = "requestTruck",
                                mainPanel(
                                  tabsetPanel(type = "tabs",
                                              tabPanel("Create Request", 
                                                       fluidRow(width = 12, status = "primary",
                                                                column(width = 6,
                                                                       selectInput("rt_terminal", "Terminal", c(
                                                                         "RWG",	
                                                                         "ECT",
                                                                         "APMII"
                                                                       )),
                                                                       br(),
                                                                       h4("Destination"),
                                                                       #br(),
                                                                       textInput("rt_country", "Country", 
                                                                                 value = "Netherlands"),
                                                                       textInput("rt_city", "City", 
                                                                                 value = "Hague"),
                                                                       textInput("rt_street", "Street", 
                                                                                 value = "Hoefkade"),
                                                                       textInput("rt_house", "House", 
                                                                                 value = "9")
                                                                       
                                                                ),
                                                                column(width = 6,
                                                                       radioButtons("rt_cntnrType", "Container Type",
                                                                                    choices = list("TWENTY", "FOURTY"),
                                                                                    selected = "TWENTY"),
                                                                       checkboxInput("rt_adr", "ADR", value = FALSE),
                                                                       dateInput("rt_date_avl", 
                                                                                 "Pickup Date", 
                                                                                 value = "2018-02-20"),
                                                                       dateInput("rt_date_del", 
                                                                                 "Delivery Date", 
                                                                                 value = "2018-02-25"),
                                                                       textInput("rt_cntnrNum", "Container Number", 
                                                                                 value = "12345"),
                                                                       
                                                                       actionButton("rt_submit", "Submit Request!")
                                                                       # selectInput("rt_slot", "Slot", c(
                                                                       #   "00:00 - 06:00",
                                                                       #   "06:00 - 12:00",
                                                                       #   "12:00 - 18:00",
                                                                       #   "18:00 - 00:00"
                                                                       # ))
                                                                       # selectInput("rt_contract", "Contract Type", c(
                                                                       #   "Import" = "IMP",	
                                                                       #   "Export" = "EXP"),
                                                                       #   selected = "IMP"),
                                                                       #textInput("rt_cntnrAddr", "Delivery Notes", 
                                                                       #        value = "Enter text...")
                                                                       #checkboxInput("rt_loaded", "Loaded", value = TRUE),
                                                                       #        radioButtons("rt_exim", "", choices = list(
                                                                       #        "Import" = "IMP",	
                                                                       #        "Export" = "EXP"),
                                                                       #        selected = "IMP")
                                                                )
                                                       ),
                                                       fluidRow(width = 12, status = "info",
                                                                column(width = 12,
                                                                       br(),
                                                                       verbatimTextOutput("rt_create_container_status"),
                                                                       br(),
                                                                       br(),
                                                                       verbatimTextOutput("rt_create_job_offer_status")
                                                                )
                                                       )
                                              ),
                                              tabPanel("Manage Requests",
                                                       # fluidRow(width = 12,
                                                       #          selectInput("rt_filter", "Request types:", choices = list(
                                                       #            "Open" = 0,	
                                                       #            "Cancelled" = 1,	
                                                       #            "Contracted" = 2,
                                                       #            "All" = 3),
                                                       #            selected = "Accept")
                                                       #          
                                                       # ),
                                                       fluidRow(width =12,
                                                                column(width = 1,
                                                                       br()
                                                                ),
                                                                column(width =11,
                                                                       br(),
                                                                       actionButton("rt_refresh", "Refresh"),
                                                                       br(),
                                                                       dataTableOutput("rt_requestsTable")
                                                                )
                                                       ),
                                                       fluidRow(width = 12, status = "primary",
                                                                column(width = 6,
                                                                       verbatimTextOutput("rt_request_details")
                                                                ),
                                                                column(width = 6,
                                                                       actionButton("rt_view_bids", "View Bids")
                                                                )
                                                       )
                                              )
                                  )
                                )
                                
                        ),
                        
                        tabItem(tabName = "viewBids",
                                
                                fluidRow(width = 12, status = "primary",
                                         column(width = 12,
                                                uiOutput("vb_filters")
                                         )
                                ),
                                fluidRow(width= 12,
                                         column(width = 12,
                                                br(),
                                                actionButton("vb_refresh", "Refresh"),
                                                br(),
                                                dataTableOutput("vb_bidsTable")
                                         )
                                         
                                ),
                                fluidRow(width =12, status = "primary",
                                         column(width = 6,
                                                verbatimTextOutput("vb_bid_details")
                                         ),
                                         column(width = 6,
                                                actionButton("vb_accept_bid", "Accept Bid")
                                         )
                                ),
                                fluidRow(width = 12, status = "info",
                                         column(width = 12,
                                                verbatimTextOutput("vb_accept_bid_status")
                                         )
                                         
                                )
                        ),
                        tabItem(tabName = "viewContracts",
                                # fluidRow(width = 12,
                                #          selectInput("vc_filter", "Contract types:", choices = list(
                                #            "Under Process" = 0,
                                #            "Settled" = 1,
                                #            "Exception Raised" = 2),
                                #            selected = "Under Process")
                                # ),
                                fluidRow( width = 12,
                                          column(width = 1,
                                                 br()
                                          ),
                                          column(width = 11,
                                                 actionButton("vc_refresh", "Refresh")
                                          )
                                ),
                                fluidRow(width = 12,
                                         br(),
                                         br(),
                                         dataTableOutput("vc_contractsTable")
                                ),
                                fluidRow(width = 12, status = "primary",
                                         column(width = 6,
                                                verbatimTextOutput("vc_contract_details")
                                         ),
                                         column(width = 6,
                                                actionButton("vc_accept_delivery", "Accept Delivery"),
                                                br(),
                                                br(),
                                                textInput("vc_exception_details", "Exception Detials", value = "Enter text.."),
                                                br(),
                                                br(),
                                                actionButton("vc_exception", "Raise Exception")
                                         )
                                         
                                ),
                                fluidRow(width = 12,
                                         column(width =12,
                                                verbatimTextOutput("vc_contract_update_status")
                                         )
                                )
                        ),
                        tabItem(tabName = "profile",
                                fluidRow(width = 12,
                                         column(width =12,
                                                box(width = 12, status = "info", title = "Connection profile",
                                                    verbatimTextOutput("pr_rest_details"),
                                                    textInput("pr_rest_addr", "REST Server Address:",
                                                              value = default_rest_addr),
                                                    actionButton("pr_update_rest", "Update")
                                                ),
                                                box(width = 12, status = "info", title = "My profile",
                                                    verbatimTextOutput("pr_shipper_details"),
                                                    textInput("pr_shipper_id", "My ID:",
                                                              value = default_shipper_id),
                                                    actionButton("pr_update_id", "Update")
                                                )
                                         )
                                )
                        )
                      )
                    )
)

server <- function(input, output, session) {
  #================================= Reactive values ========================================
  profileInfo <- reactiveValues(
    rest_addr = default_rest_addr,
    rest_status = "Unknown",
    shipper_id = default_shipper_id,
    accept_bid_status = "",
    update_contract_status = "",
    create_job_offer_status = "",
    create_container_info_status = "",
    selectedRequest = ""
  )
  
  ##================================== Create and view requests ================================
  
  ##-----------------Request------------
  
  observeEvent(input$rt_submit, {
    isolate({
      
      adr_stat = "NONE"
      if(input$rt_adr)
        adr_stat = "YES"
      
      profileInfo$create_container_info_status <- paste("Container: ", as.character(POST(paste0(profileInfo$rest_addr, api_shipper_profile, "/", api_create_container_info),
                                                                                         body = list(containerId = input$rt_cntnrNum,
                                                                                                     ownerId = profileInfo$shipper_id,
                                                                                                     containerSize = input$rt_cntnrType
                                                                                         ),
                                                                                         encode = "json")))
      
      profileInfo$create_job_offer_status <- paste("Request: ", as.character(POST(paste0(profileInfo$rest_addr, api_shipper_profile, "/", api_create_job_offer),
                                                                                  body = list(containerDeliveryJobOfferId = input$rt_cntnrNum,
                                                                                              containerGuyId= profileInfo$shipper_id,
                                                                                              containerInfoId = input$rt_cntnrNum,
                                                                                              availableForPickupDateTime = as.character(input$rt_date_avl),
                                                                                              toBeDeliveredByDateTime = as.character(input$rt_date_del),
                                                                                              terminalContainerAvailableAt = input$rt_terminal,
                                                                                              destination = list(country = input$rt_country,
                                                                                                                 city = input$rt_city,
                                                                                                                 street = input$rt_street,
                                                                                                                 housenumber = input$rt_house),
                                                                                              requiredAdrTraining = adr_stat
                                                                                  ),
                                                                                  encode = "json")))
    })
  })
  
  observeEvent(
    input$rt_terminal, 
    isolate({
      profileInfo$create_container_info_status = ""
      profileInfo$create_job_offer_status = ""
    })
  )
  
  output$rt_create_container_status = renderPrint({
    cat(profileInfo$create_container_info_status)
  })
  
  output$rt_create_job_offer_status = renderPrint({
    cat(profileInfo$create_job_offer_status)
  })
  
  ##-----------------Manage---------------
  
  output$rt_request_details = renderPrint({
    container_history = as.data.frame(fromJSON(paste0(profileInfo$rest_addr,
                                                      api_shipper_profile, "/", 
                                                      api_job_offers_history,"/",
                                                      profileInfo$shipper_id)))
    s <- container_history$containerDeliveryJobOfferId[input$rt_requestsTable_rows_selected]
    if (length(s)) {
      cat('Request', s, 'has been selected.\n\n')
    }
  })
  
  output$rt_requestsTable <- DT::renderDataTable(server = TRUE,
                                                 selection = 'single',
                                                 extensions = "Buttons", 
                                                 options = list(stringsAsFactors = FALSE, autoWidth = TRUE), rownames= FALSE,
                                                 {
                                                   input$rt_refresh
                                                   isolate({
                                                     container_history = select(as.data.frame(fromJSON(paste0(profileInfo$rest_addr, 
                                                                                                              api_shipper_profile, "/", 
                                                                                                              api_job_offers_history,"/", 
                                                                                                              profileInfo$shipper_id))),
                                                                                containerDeliveryJobOfferId,
                                                                                availableForPickupDateTime,
                                                                                toBeDeliveredByDateTime,
                                                                                destination,
                                                                                requiredAdrTraining,
                                                                                status
                                                     )
                                                     container_history
                                                   })
                                                 }
  )
  
  observeEvent(
    input$rt_view_bids,
    {
      isolate({
        if(input$rt_requestsTable_rows_selected){
          container_history = as.data.frame(fromJSON(paste0(profileInfo$rest_addr,
                                                            api_shipper_profile, "/", 
                                                            api_job_offers_history,"/",
                                                            profileInfo$shipper_id)))
          profileInfo$selectedRequest = container_history$containerDeliveryJobOfferId[input$rt_requestsTable_rows_selected]
          updateTabsetPanel(session, "mainmenu", selected = "viewBids")
        }
      })
    }
  )
  
  ##================================== View and accept Bids ====================================
  
  
  output$vb_filters <- renderUI({
    requestIDs = unique(as.data.frame(fromJSON(paste0(profileInfo$rest_addr,
                                                      api_shipper_profile, "/", 
                                                      api_job_offers_history,"/",
                                                      profileInfo$shipper_id)))$containerDeliveryJobOfferId)
    if(profileInfo$selectedRequest!=""){
      selectInput("vb_cntnrID", "Select Request ID:", choices = requestIDs, selected = profileInfo$selectedRequest)
    }
    else
      selectInput("vb_cntnrID", "Select Request ID:", choices = requestIDs)
  })
  
  output$vb_bid_details = renderPrint({
    bids_table = as.data.frame(fromJSON(paste0(profileInfo$rest_addr, path_job_offers, "/", 
                                               input$vb_cntnrID,"/", api_get_bids)))
    s <- bids_table$truckerBidId[input$vb_bidsTable_rows_selected]
    if (length(s)) {
      cat('Bid', s, 'has been selected.\n\n')
    }
  })
  
  
  output$vb_bidsTable <- DT::renderDataTable(server = TRUE,
                                             selection = 'single',
                                             extensions = "Buttons", 
                                             options = list(stringsAsFactors = FALSE, autoWidth = TRUE), rownames= FALSE,
                                             #dom = "Bfrtip", 
                                             #buttons = list('copy', 'pdf', 'csv', 'excel', 'print')),
                                             {
                                               input$vb_cntnrID
                                               input$vb_refresh
                                               isolate({
                                                 bid_list <- select(as.data.frame(fromJSON(paste0(profileInfo$rest_addr,
                                                                                                  path_job_offers, "/",
                                                                                                  input$vb_cntnrID,"/",
                                                                                                  api_get_bids))),
                                                                    truckerBidId,
                                                                    bidAmount)
                                                 bid_list <- mutate(bid_list, 
                                                                    JobsDelivered = as.data.frame(fromJSON(paste0(profileInfo$rest_addr, "Trucker/", substr(truckerBidId, 1, 1))))$rating.jobsDelivered[1],
                                                                    JobsAccepted = as.data.frame(fromJSON(paste0(profileInfo$rest_addr, "Trucker/", substr(truckerBidId, 1, 1))))$rating.totalPastJobsAccepted[1]
                                                 )
                                                 bid_list
                                               })
                                             }
  )
  
  observeEvent(
    input$vb_accept_bid, 
    isolate({
      bids_table = as.data.frame(fromJSON(paste0(profileInfo$rest_addr, path_job_offers, "/", 
                                                 input$vb_cntnrID,"/", api_get_bids)))
      bid_Id <- bids_table$truckerBidId[input$vb_bidsTable_rows_selected]
      request_Id <- input$vb_cntnrID
      profileInfo$accept_bid_status <- as.character(POST(paste0(profileInfo$rest_addr,
                                                                path_job_offers, "/",
                                                                request_Id, "/",
                                                                api_accept_bid, "/",
                                                                bid_Id)))
    })
  )
  
  observeEvent(
    input$vb_bidsTable_rows_selected,
    isolate({
      profileInfo$accept_bid_status = ""
    })
  )
  
  output$vb_accept_bid_status = renderPrint({
    cat(profileInfo$accept_bid_status)
  })
  
  ##=============================== Track and update contracts =============================
  
  
  output$vc_contract_details = renderPrint({
    s = input$vc_contractsTable_rows_selected
    if (length(s)) {
      cat('Contract', s, 'has been selected.\n\n')
    }
  })
  
  output$vc_contractsTable <- DT::renderDataTable(server = TRUE,
                                                  selection = 'single',
                                                  extensions = "Buttons", 
                                                  options = list( stringsAsFactors = FALSE, autoWidth = TRUE), rownames= FALSE,
                                                  {
                                                    input$vc_refresh
                                                    isolate({
                                                      as.data.frame(fromJSON(paste0(profileInfo$rest_addr,
                                                                                    api_shipper_profile, "/",
                                                                                    api_contract_list, "/",
                                                                                    profileInfo$shipper_id)))
                                                    })
                                                  }
  )
  
  observeEvent(
    input$vc_accept_delivery, 
    isolate({
      contracts_table = as.data.frame(fromJSON(paste0(profileInfo$rest_addr,
                                                      api_shipper_profile, "/",
                                                      api_contract_list, "/",
                                                      profileInfo$shipper_id)))
      contract_Id <- contracts_table$containerDeliveryJobId[input$vc_contractsTable_rows_selected]
      contract_Id = 3062
      profileInfo$update_contract_status <- as.character(POST(paste0(profileInfo$rest_addr,
                                                                     api_shipper_profile, "/",
                                                                     api_accept_delivery, "/",
                                                                     contract_Id)))
      #body=list(password ="123"),
      #encode = "json"))
    })
  )
  
  observeEvent(
    input$vc_exception, 
    isolate({
      contracts_table = as.data.frame(fromJSON(paste0(profileInfo$rest_addr,
                                                      api_shipper_profile, "/",
                                                      api_contract_list, "/",
                                                      profileInfo$shipper_id)))
      ontract_Id <- contracts_table$containerDeliveryJobId[input$vc_contractsTable_rows_selected]
      contract_Id = 2007
      profileInfo$update_contract_status <- as.character(POST(paste0(profileInfo$rest_addr,
                                                                     path_contracts, "/",
                                                                     contract_Id, "/",
                                                                     api_raise_exception),
                                                              body = list(details = input$vc_exception_details)
      ))
    })
  )
  
  observeEvent(
    input$vc_contractsTable_rows_selected,
    isolate({
      profileInfo$update_contract_status = ""
    })
  )
  
  output$vc_contract_update_status = renderPrint({
    cat(profileInfo$update_contract_status)
  })
  
  # actionButton("vc_accept_delivery", "Accept Delivery"),
  # textInput("vc_exception_details", "Exception Detials", value = "Enter text.."),
  # actionButton("vc_exception", "Raise Exception")
  # update_contract_status = "",
  # path_contracts = "ContainerDeliveryJob"
  # api_accept_delivery = "acceptDelivery"
  # api_raise_exception = "raiseException"
  # verbatimTextOutput("vc_contract_update_status")
  
  ##==================================Profile================================================
  
  output$pr_rest_details <- renderPrint({
    isolate({
      addr = profileInfo$rest_addr
      profileInfo$rest_status <- content(GET(paste0(default_rest_addr, api_initialization)), "text")
      if (length(addr)) {
        cat('REST Server: ', addr, '\n\n')
        cat('Connection Status: ', profileInfo$rest_status, '\n')
      }
    })
  })
  
  observeEvent(input$pr_update_rest, isolate(profileInfo$rest_addr <- input$pr_rest_addr))
  
  output$pr_shipper_details <- renderPrint({
    id = profileInfo$shipper_id
    if (length(id)) {
      cat('Shipper ID: ', id, '\n\n')
    }
  })
  
  observeEvent(input$pr_update_id, isolate(profileInfo$shipper_id <- input$pr_shipper_id))
  
}

##================================ Run the application =====================================
shinyApp(ui = ui, server = server)

